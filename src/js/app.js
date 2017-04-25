var log = function(val, base) {
    return Math.log(val) / Math.log(base);
};
var strToClass = function(str){
    var className = "";
    str = str.toLowerCase();
    var validChars = 'abcdefghijklmnopqrstuvwxyz';
    var newWord = false;
    for(var i = 0; i < str.length; i++) {
        var chr = str[i];
        if(validChars.indexOf(chr) >= 0) {
            if(newWord) chr = chr.toUpperCase();
            className += chr;
            newWord = false;
        }
        else {
            newWord = true;
        }
    }
    return className;
};
var addCssRule = function(selector, rules){
    var sheet = document.styleSheets[0];
    if("insertRule" in sheet) {
        sheet.insertRule(selector + "{" + rules + "}", 0);
    }
    else if("addRule" in sheet) {
        sheet.addRule(selector, rules, 0);
    }
};

var kinks = {};
var inputKinks = {}
var colors = {}
var level = {};

$(function(){

    var imgurClientId = '9db53e5936cd02f';

    inputKinks = {
        $columns: [],
        createCategory: function(name, fields){
            var $category = $('<div class="kinkCategory">')
                .addClass('cat-' + strToClass(name))
                .data('category', name)
                .append($('<h2>')
                    .text(name));

            var $table = $('<table class="kinkGroup">').data('fields', fields);
            var $thead = $('<thead>').appendTo($table);
            for(var i = 0; i < fields.length; i++) {
                $('<th>').addClass('choicesCol').text(fields[i]).appendTo($thead);
            }
            $('<th>').appendTo($thead);
            $('<tbody>').appendTo($table);
            $category.append($table);

            return $category;
        },
        createChoice: function(){
            var $container = $('<div>').addClass('choices');
            var levels = Object.keys(level);
            for(var i = 0; i < levels.length; i++) {
                $('<button>')
                    .addClass('choice')
                    .addClass(level[levels[i]])
                    .data('level', levels[i])
                    .data('levelInt', i)
                    .attr('title', levels[i])
                    .appendTo($container)
                    .on('click', function(){
                        $container.find('button').removeClass('selected');
                        $(this).addClass('selected');
                    });
            }
            return $container;
        },
        createKink: function(fields, name){
            var $row = $('<tr>').data('kink', name).addClass('kinkRow');
            for(var i = 0; i < fields.length; i++) {
                var $choices = inputKinks.createChoice();
                $choices.data('field', fields[i]);
                $choices.addClass('choice-' + strToClass(fields[i]));
                $('<td>').append($choices).appendTo($row);
            }
            $('<td>').text(name).appendTo($row);
            $row.addClass('kink-' + strToClass(name));
            return $row;
        },
        createColumns: function(){
            var colClasses = ['100', '50', '33', '25'];

            var numCols = Math.floor((document.body.scrollWidth - 20) / 400);
            if(!numCols) numCols = 1;
            if(numCols > 4) numCols = 4;
            var colClass = 'col' + colClasses[numCols - 1];

            inputKinks.$columns = [];
            for(var i = 0; i < numCols; i++){
                inputKinks.$columns.push($('<div>').addClass('col ' + colClass).appendTo($('#InputList')));
            }
        },
        placeCategories: function($categories){
            var $body = $('body');
            var totalHeight = 0;
            for(var i = 0; i < $categories.length; i++) {
                var $clone = $categories[i].clone().appendTo($body);
                var height = $clone.height();;
                totalHeight += height;
                $clone.remove();
            }

            var colHeight = totalHeight / (inputKinks.$columns.length);
            var colIndex = 0;
            for(var i = 0; i < $categories.length; i++) {
                var curHeight = inputKinks.$columns[colIndex].height();
                var catHeight = $categories[i].height();
                if(curHeight + (catHeight / 2) > colHeight) colIndex++;
                while(colIndex >= inputKinks.$columns.length) {
                    colIndex--;
                }
                inputKinks.$columns[colIndex].append($categories[i]);
            }
        },
        fillInputList: function(){
            $('#InputList').empty();
            inputKinks.createColumns();

            var $categories = [];
            var kinkCats = Object.keys(kinks);
            for(var i = 0; i < kinkCats.length; i++) {
                var catName = kinkCats[i];
                var category = kinks[catName];
                var fields = category.fields;
                var kinkArr = category.kinks;

                var $category = inputKinks.createCategory(catName, fields);
                var $tbody = $category.find('tbody');
                for(var k = 0; k < kinkArr.length; k++) {
                    $tbody.append(inputKinks.createKink(fields, kinkArr[k]));
                }

                $categories.push($category);
            }
            inputKinks.placeCategories($categories);

            // Make things update hash
            $('#InputList').find('button.choice').on('click', function(){
                location.hash = inputKinks.updateHash();
            });
        },
        init: function(){
            // Set up DOM
            inputKinks.fillInputList();

            // Read hash
            inputKinks.parseHash();

            // Make export button work
            $('#Export').on('click', inputKinks.export);
            $('#URL').on('click', function(){ this.select(); });

            // On resize, redo columns
            (function(){

                var lastResize = 0;
                $(window).on('resize', function(){
                    var curTime = (new Date()).getTime();
                    lastResize = curTime;
                    setTimeout(function(){
                        if(lastResize === curTime) {
                            inputKinks.fillInputList();
                            inputKinks.parseHash();
                        }
                    }, 500);
                });

            })();
        },
        hashChars: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.=+*^!@",
        maxPow: function(base, maxVal) {
            var maxPow = 1;
            for(var pow = 1; Math.pow(base, pow) <= maxVal; pow++){
                maxPow = pow;
            }
            return maxPow;
        },
        prefix: function(input, len, char){
            while(input.length < len) {
                input = char + input;
            }
            return input;
        },
        drawLegend: function(context){
            context.font = "bold 13px Arial";
            context.fillStyle = '#000000';

            var levels = Object.keys(colors);
            var x = context.canvas.width - 15 - (120 * levels.length);
            for(var i = 0; i < levels.length; i++) {
                context.beginPath();
                context.arc(x + (120 * i), 17, 8, 0, 2 * Math.PI, false);
                context.fillStyle = colors[levels[i]];
                context.fill();
                context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
                context.lineWidth = 1;
                context.stroke();

                context.fillStyle = '#000000';
                context.fillText(levels[i], x + 15 + (i * 120), 22);
            }
        },
        setupCanvas: function(width, height, username){
            $('canvas').remove();
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            var $canvas = $(canvas);
            $canvas.css({
                width: width,
                height: height
            });
            // $canvas.insertBefore($('#InputList'));

            var context = canvas.getContext('2d');
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = "bold 24px Arial";
            context.fillStyle = '#000000';
            context.fillText('Kinklist ' + username, 5, 25);

            inputKinks.drawLegend(context);
            return { context: context, canvas: canvas };
        },
        drawCallHandlers: {
            simpleTitle: function(context, drawCall){
                context.fillStyle = '#000000';
                context.font = "bold 18px Arial";
                context.fillText(drawCall.data, drawCall.x, drawCall.y + 5);
            },
            titleSubtitle: function(context, drawCall){
                context.fillStyle = '#000000';
                context.font = "bold 18px Arial";
                context.fillText(drawCall.data.category, drawCall.x, drawCall.y + 5);

                var fieldsStr = drawCall.data.fields.join(', ');
                context.font = "italic 12px Arial";
                context.fillText(fieldsStr, drawCall.x, drawCall.y + 20);
            },
            kinkRow: function(context, drawCall){
                context.fillStyle = '#000000';
                context.font = "12px Arial";

                var x = drawCall.x + 5 + (drawCall.data.choices.length * 20);
                var y = drawCall.y - 6;
                context.fillText(drawCall.data.text, x, y);

                // Circles
                for(var i = 0; i < drawCall.data.choices.length; i++){
                    var choice = drawCall.data.choices[i];
                    var color = colors[choice];

                    var x = 10 + drawCall.x + (i * 20);
                    var y = drawCall.y - 10;

                    context.beginPath();
                    context.arc(x, y, 8, 0, 2 * Math.PI, false);
                    context.fillStyle = color;
                    context.fill();
                    context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
                    context.lineWidth = 1;
                    context.stroke();
                }

            }
        },
        export: function(){
            var username = prompt("Please enter your name");
            if(typeof username !== 'string') return;
            else if (username.length ) username = '(' + username + ')';

            $('#Loading').fadeIn();
            $('#URL').fadeOut();

            // Constants
            var numCols = 6;
            var columnWidth = 250;
            var simpleTitleHeight = 35;
            var titleSubtitleHeight = 50;
            var rowHeight = 25;
            var offsets = {
                left: 10,
                right: 10,
                top: 50,
                bottom: 10
            };

            // Find out how many we have of everything
            var numCats = $('.kinkCategory').length;
            var dualCats = $('.kinkCategory th + th + th').length;
            var simpleCats = numCats - dualCats;
            var numKinks = $('.kinkRow').length;

            // Determine the height required for all categories and kinks
            var totalHeight = (
                (numKinks * rowHeight) +
                (dualCats * titleSubtitleHeight) +
                (simpleCats * simpleTitleHeight)
            );

            // Initialize columns and drawStacks
            var columns = [];
            for(var i = 0; i < numCols; i++){
                columns.push({ height: 0, drawStack: []});
            }

            // Create drawcalls and place them in the drawStack
            // for the appropriate column
            var avgColHeight = totalHeight / numCols;
            var columnIndex = 0;
            $('.kinkCategory').each(function(){
                var $cat = $(this);
                var catName = $cat.data('category');
                var category = kinks[catName];
                var fields = category.fields;
                var catKinks = category.kinks;

                var catHeight = 0;
                catHeight += (fields.length === 1) ? simpleTitleHeight : titleSubtitleHeight;
                catHeight += (catKinks.length * rowHeight);

                // Determine which column to place this category in
                if((columns[columnIndex].height + (catHeight / 2)) > avgColHeight) columnIndex++;
                while(columnIndex >= numCols) columnIndex--;
                var column = columns[columnIndex];

                // Drawcall for title
                var drawCall = { y: column.height };
                column.drawStack.push(drawCall);
                if(fields.length < 2) {
                    column.height += simpleTitleHeight;
                    drawCall.type =  'simpleTitle';
                    drawCall.data = catName;
                }
                else {
                    column.height += titleSubtitleHeight;
                    drawCall.type =  'titleSubtitle';
                    drawCall.data = {
                        category: catName,
                        fields: fields
                    };
                }

                // Drawcalls for kinks
                $cat.find('.kinkRow').each(function(){
                    var $kinkRow = $(this);
                    var drawCall = { y: column.height, type: 'kinkRow', data: {
                        choices: [],
                        text: $kinkRow.data('kink')
                    }};
                    column.drawStack.push(drawCall);
                    column.height += rowHeight;

                    // Add choices
                    $kinkRow.find('.choices').each(function(){
                        var $selection = $(this).find('.choice.selected');
                        var selection = ($selection.length > 0)
                            ? $selection.data('level')
                            : Object.keys(level)[0];

                        drawCall.data.choices.push(selection);
                    });
                });
            });

            var tallestColumnHeight = 0;
            for(var i = 0; i < columns.length; i++){
                if(tallestColumnHeight < columns[i].height) {
                    tallestColumnHeight = columns[i].height;
                }
            }

            var canvasWidth = offsets.left + offsets.right + (columnWidth * numCols);
            var canvasHeight = offsets.top + offsets.bottom + tallestColumnHeight;
            var setup = inputKinks.setupCanvas(canvasWidth, canvasHeight, username);
            var context = setup.context;
            var canvas = setup.canvas;

            for(var i = 0; i < columns.length; i++) {
                var column = columns[i];
                var drawStack = column.drawStack;

                var drawX = offsets.left + (columnWidth * i);
                for(var j = 0; j < drawStack.length; j++){
                    var drawCall = drawStack[j];
                    drawCall.x = drawX;
                    drawCall.y += offsets.top;
                    inputKinks.drawCallHandlers[drawCall.type](context, drawCall);
                }
            }

            //return $(canvas).insertBefore($('#InputList'));

            // Send canvas to imgur
            $.ajax({
                url: 'https://api.imgur.com/3/image',
                type: 'POST',
                headers: {
                    // Your application gets an imgurClientId from Imgur
                    Authorization: 'Client-ID ' + imgurClientId,
                    Accept: 'application/json'
                },
                data: {
                    // convert the image data to base64
                    image:  canvas.toDataURL().split(',')[1],
                    type: 'base64'
                },
                success: function(result) {
                    $('#Loading').hide();
                    var url = 'https://i.imgur.com/' + result.data.id + '.png';
                    $('#URL').val(url).fadeIn();
                },
                fail: function(){
                    $('#Loading').hide();
                    alert('Failed to upload to imgur, could not connect');
                }
            });
        },
        encode: function(base, input){
            var hashBase = inputKinks.hashChars.length;
            var outputPow = inputKinks.maxPow(hashBase, Number.MAX_SAFE_INTEGER);
            var inputPow = inputKinks.maxPow(base, Math.pow(hashBase, outputPow));

            var output = "";
            var numChunks = Math.ceil(input.length / inputPow);
            var inputIndex = 0;
            for(var chunkId = 0; chunkId < numChunks; chunkId++) {
                var inputIntValue = 0;
                for(var pow = 0; pow < inputPow; pow++) {
                    var inputVal = input[inputIndex++];
                    if(typeof inputVal === "undefined") break;
                    var val = inputVal * Math.pow(base, pow);
                    inputIntValue += val;
                }

                var outputCharValue = "";
                while(inputIntValue > 0) {
                    var maxPow = Math.floor(log(inputIntValue, hashBase));
                    var powVal = Math.pow(hashBase, maxPow);
                    var charInt = Math.floor(inputIntValue / powVal);
                    var subtract = charInt * powVal;
                    var char = inputKinks.hashChars[charInt];
                    outputCharValue += char;
                    inputIntValue -= subtract;
                }
                var chunk = inputKinks.prefix(outputCharValue, outputPow, inputKinks.hashChars[0]);
                output += chunk;
            }
            return output;
        },
        decode: function(base, output){
            var hashBase = inputKinks.hashChars.length;
            var outputPow = inputKinks.maxPow(hashBase, Number.MAX_SAFE_INTEGER);

            var values = [];
            var numChunks = Math.max(output.length / outputPow)
            for(var i = 0; i < numChunks; i++){
                var chunk = output.substring(i * outputPow, (i + 1) * outputPow);
                var chunkValues = inputKinks.decodeChunk(base, chunk);
                for(var j = 0; j < chunkValues.length; j++) {
                    values.push(chunkValues[j]);
                }
            }
            return values;
        },
        decodeChunk: function(base, chunk){
            var hashBase = inputKinks.hashChars.length;
            var outputPow = inputKinks.maxPow(hashBase, Number.MAX_SAFE_INTEGER);
            var inputPow = inputKinks.maxPow(base, Math.pow(hashBase, outputPow));

            var chunkInt = 0;
            for(var i = 0; i < chunk.length; i++) {
                var char = chunk[i];
                var charInt = inputKinks.hashChars.indexOf(char);
                var pow = chunk.length - 1 - i;
                var intVal = Math.pow(hashBase, pow) * charInt;
                chunkInt += intVal;
            }
            var chunkIntCopy = chunkInt;

            var output = [];
            for(var pow = inputPow - 1; pow >= 0; pow--) {
                var posBase = Math.floor(Math.pow(base, pow));
                var posVal = Math.floor(chunkInt / posBase);
                var subtract = posBase * posVal;
                output.push(posVal);
                chunkInt -= subtract;
            }
            output.reverse();
            return output;
        },
        updateHash: function(){
            var hashValues = [];
            $('#InputList .choices').each(function(){
                var $this = $(this);
                var lvlInt = $this.find('.selected').data('levelInt');
                if(!lvlInt) lvlInt = 0;
                hashValues.push(lvlInt);
            });
            return inputKinks.encode(Object.keys(colors).length, hashValues);
        },
        parseHash: function(){
            var hash = location.hash.substring(1);
            if(hash.length < 10) return;

            var values = inputKinks.decode(Object.keys(colors).length, hash);
            var valueIndex = 0;
            $('#InputList .choices').each(function(){
                var $this = $(this);
                var value = values[valueIndex++];
                $this.children().eq(value).addClass('selected');
            });
        },
        saveSelection: function(){
            var selection = [];
            $('.choice.selected').each(function(){
                // .choice selector
                var selector = '.' + this.className.replace(/ /g, '.');
                // .choices selector
                selector = '.' + $(this).closest('.choices')[0].className.replace(/ /g, '.') + ' ' + selector;
                // .kinkRow selector
                selector = '.' + $(this).closest('tr.kinkRow')[0].className.replace(/ /g, '.') + ' ' + selector;
                // .kinkCategory selector
                selector = '.' + $(this).closest('.kinkCategory')[0].className.replace(/ /g, '.') + ' ' + selector;
                selector = selector.replace('.selected', '');
                selection.push(selector);
            });
            return selection;
        },
        inputListToText: function(){
            var KinksText = "";
            var kinkCats = Object.keys(kinks);
            for(var i = 0; i < kinkCats.length; i++){
                var catName = kinkCats[i];
                var catFields = kinks[catName].fields;
                var catKinks = kinks[catName].kinks;
                KinksText += '#' + catName + "\r\n";
                KinksText += '(' + catFields.join(', ') + ")\r\n";
                for(var j = 0; j < catKinks.length; j++){
                    KinksText += '* ' + catKinks[j] + "\r\n";
                }
                KinksText += "\r\n";
            }
            return KinksText;
        },
        restoreSavedSelection: function(selection){
            setTimeout(function(){
                for(var i = 0; i < selection.length; i++){
                    var selector = selection[i];
                    $(selector).addClass('selected');
                }
                location.hash = inputKinks.updateHash();
            }, 300);
        },
        parseKinksText: function(kinksText){
            var newKinks = {};
            var lines = kinksText.replace(/\r/g, '').split("\n");

            var cat = null;
            var catName = null;
            for(var i = 0; i < lines.length; i++){
                var line = lines[i];
                if(!line.length) continue;

                if(line[0] === '#') {
                    if(catName){
                        if(!(cat.fields instanceof Array) || cat.fields.length < 1){
                            alert(catName + ' does not have any fields defined!');
                            return;
                        }
                        if(!(cat.kinks instanceof Array) || cat.kinks.length < 1){
                            alert(catName + ' does not have any kinks listed!');
                            return;
                        }
                        newKinks[catName] = cat;
                    }
                    catName = line.substring(1).trim();
                    cat = { kinks: [] };
                }
                if(!catName) continue;
                if(line[0] === '(') {
                    cat.fields = line.substring(1, line.length - 1).trim().split(',');
                    for(var j = 0; j < cat.fields.length; j++){
                        cat.fields[j] = cat.fields[j].trim();
                    }
                }
                if(line[0] === '*'){
                    var kink = line.substring(1).trim();
                    cat.kinks.push(kink);
                }
            }
            if(catName && !newKinks[catName]){
                if(!(cat.fields instanceof Array) || cat.fields.length < 1){
                    alert(catName + ' does not have any fields defined!');
                    return;
                }
                if(!(cat.kinks instanceof Array) || cat.kinks.length < 1){
                    alert(catName + ' does not have any kinks listed!');
                    return;
                }
                newKinks[catName] = cat;
            }
            return newKinks;
        }
    };

    $('#Edit').on('click', function(){
        var KinksText = inputKinks.inputListToText();
        $('#Kinks').val(KinksText.trim());
        $('#EditOverlay').fadeIn();
    });
    $('#EditOverlay').on('click', function(){
        $(this).fadeOut();
    });
    $('#KinksOK').on('click', function(){
        var selection = inputKinks.saveSelection();
        try {
            var kinksText = $('#Kinks').val();
            kinks = inputKinks.parseKinksText(kinksText);
            inputKinks.fillInputList();
        }
        catch(e){
            alert('An error occured trying to parse the text entered, please correct it and try again');
            return;
        }
        inputKinks.restoreSavedSelection(selection);
        $('#EditOverlay').fadeOut();
    });
    $('.overlay > *').on('click', function(e){
        e.stopPropagation();
    });

    var stylesheet = document.styleSheets[0];
    $('.legend .choice').each(function(){
        var $choice = $(this);
        var $parent = $choice.parent();
        var text = $parent.text().trim();
        var color = $choice.data('color');
        var cssClass = this.className.replace('choice ', '').trim();

        addCssRule('.choice.' + cssClass, 'background-color: ' + color + ';');
        colors[text] = color;
        level[text] = cssClass;
    });

    kinks = inputKinks.parseKinksText($('#Kinks').text().trim());
    inputKinks.init();

    (function(){
        var $popup = $('#InputOverlay');
        var $previous = $('#InputPrevious');
        var $next = $('#InputNext');

        // current
        var $category = $('#InputCategory');
        var $field = $('#InputField');
        var $options = $('#InputValues');

        function getChoiceValue($choices){
            var $selected = $choices.find('.choice.selected');
            return $selected.data('level');
        }

        function getChoicesElement(category, kink, field){
            var selector = '.cat-' + strToClass(category);
            selector += ' .kink-' + strToClass(kink);
            selector += ' .choice-' + strToClass(field);

            var $choices = $(selector);
            return $choices;
        }

        inputKinks.getAllKinks = function(){
            var list = [];

            var categories = Object.keys(kinks);
            for(var i = 0; i < categories.length; i++){
                var category = categories[i];
                var fields = kinks[category].fields;
                var kinkArr = kinks[category].kinks;

                for(var j = 0; j < fields.length; j++) {
                    var field = fields[j];
                    for(var k = 0; k < kinkArr.length; k++){
                        var kink = kinkArr[k];
                        var $choices = getChoicesElement(category, kink, field);
                        var value = getChoiceValue($choices);
                        var obj = { category: category, kink: kink, field: field, value: value, $choices: $choices, showField: (fields.length >= 2)};
                        list.push(obj);
                    }
                }

            }
            return list;
        };

        inputKinks.inputPopup = {
            numPrev: 3,
            numNext: 3,
            allKinks: [],
            kinkByIndex: function(i){
                var numKinks = inputKinks.inputPopup.allKinks.length;
                i = (numKinks + i) % numKinks;
                return inputKinks.inputPopup.allKinks[i];
            },
            generatePrimary: function(kink){
                var $container = $('<div>');
                var btnIndex = 0;
                $('.legend > div').each(function(){
                    var $btn = $(this).clone();
                    $btn.addClass('big-choice');
                    $btn.appendTo($container);

                    $('<span>')
                        .addClass('btn-num-text')
                        .text(btnIndex++)
                        .appendTo($btn)

                    var text = $btn.text().trim().replace(/[0-9]/g, '');
                    if(kink.value === text) {
                        $btn.addClass('selected');
                    }

                    $btn.on('click', function(){
                        $container.find('.big-choice').removeClass('selected');
                        $btn.addClass('selected');
                        kink.value = text;
                        $options.fadeOut(200, function(){
                            $options.show();
                            inputKinks.inputPopup.showNext();
                        });
                        var choiceClass = strToClass(text);
                        kink.$choices.find('.' + choiceClass).click();
                    });
                });
                return $container;
            },
            generateSecondary: function(kink){
                var $container = $('<div class="kink-simple">');
                $('<span class="choice">').addClass(level[kink.value]).appendTo($container);
                $('<span class="txt-category">').text(kink.category).appendTo($container);
                if(kink.showField){
                    $('<span class="txt-field">').text(kink.field).appendTo($container);
                }
                $('<span class="txt-kink">').text(kink.kink).appendTo($container);
                return $container;
            },
            showIndex: function(index){
                $previous.html('');
                $next.html('');
                $options.html('');
                $popup.data('index', index);

                // Current
                var currentKink = inputKinks.inputPopup.kinkByIndex(index);
                var $currentKink = inputKinks.inputPopup.generatePrimary(currentKink);
                $options.append($currentKink);
                $category.text(currentKink.category);
                $field.text((currentKink.showField ? '(' + currentKink.field + ') ' : '') + currentKink.kink);
                $options.append($currentKink);

                // Prev
                for(var i = inputKinks.inputPopup.numPrev; i > 0; i--){
                    var prevKink = inputKinks.inputPopup.kinkByIndex(index - i);
                    var $prevKink = inputKinks.inputPopup.generateSecondary(prevKink);
                    $previous.append($prevKink);
                    (function(skip){
                        $prevKink.on('click', function(){
                            inputKinks.inputPopup.showPrev(skip);
                        });
                    })(i);
                }
                // Next
                for(var i = 1; i <= inputKinks.inputPopup.numNext; i++){
                    var nextKink = inputKinks.inputPopup.kinkByIndex(index + i);
                    var $nextKink = inputKinks.inputPopup.generateSecondary(nextKink);
                    $next.append($nextKink);
                    (function(skip){
                        $nextKink.on('click', function(){
                            inputKinks.inputPopup.showNext(skip);
                        });
                    })(i);
                }
            },
            showPrev: function(skip){
                if(typeof skip !== "number") skip = 1;
                var index = $popup.data('index') - skip;
                var numKinks = inputKinks.inputPopup.allKinks.length;
                index = (numKinks + index) % numKinks;
                inputKinks.inputPopup.showIndex(index);
            },
            showNext: function(skip){
                if(typeof skip !== "number") skip = 1;
                var index = $popup.data('index') + skip;
                var numKinks = inputKinks.inputPopup.allKinks.length;
                index = (numKinks + index) % numKinks;
                inputKinks.inputPopup.showIndex(index);
            },
            show: function(){
                inputKinks.inputPopup.allKinks = inputKinks.getAllKinks();
                inputKinks.inputPopup.showIndex(0);
                $popup.fadeIn();
            }
        };

        $(window).on('keydown', function(e){
            if(e.altKey || e.shiftKey || e.ctrlKey) return;
            if(!$popup.is(':visible')) return;

            if(e.keyCode === 38) {
                inputKinks.inputPopup.showPrev();
                e.preventDefault();
                e.stopPropagation();
            }
            if(e.keyCode === 40) {
                inputKinks.inputPopup.showNext();
                e.preventDefault();
                e.stopPropagation();
            }

            var btn = -1;
            if(e.keyCode >= 96 && e.keyCode <= 101) {
                btn = e.keyCode - 96;
            }
            else if(e.keyCode >= 48 && e.keyCode <= 53) {
                btn = e.keyCode - 48;
            }
            else {
                return;
            }

            var $btn = $options.find('.big-choice').eq(btn);
            $btn.click();
        });
        $('#StartBtn').on('click', inputKinks.inputPopup.show);
        $('#InputCurrent .closePopup, #InputOverlay').on('click', function(){
            $popup.fadeOut();
        });
    })();
});