//@codekit-prepend "settings.js"

var   guessword		= {
		  alphabet				: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
		, badLetters			: []
		, goodLetters			: []
		, usedLetters			: []
		, assumedBadLetters		: []
		, assumedGoodLetters	: []
		, actualWord			: ""
	}
	, WORDNIK_URL		= 'http://api.wordnik.com/v4'
	, WORDNIK_DEF_API	= '/word.json/'
	, WORDNIK_DEF_ARGS	= '/definitions?limit=1&api_key='+WORDNIK_API_KEY+'&callback=?'
	, WORDNIK_RND		= '/words.json/randomWord?hasDictionaryDef=true' +
							'&minLength=5&maxLength=5&minDictionaryCount=3' +
							'&excludePartOfSpeech=abbreviation,conjunction,affix,suffix' +
								',noun-posessive,family-name,given-name' +
								',proper-noun,proper-noun-plural,proper-noun-posessive' +
							'&api_key='+WORDNIK_API_KEY+'&callback=?'
	;

$(function() {

	// Set up alphabet at the top
	$.each(guessword.alphabet, function(i, letter) {
		$('.alphabet').append('<span class="letter letter-'+letter+'">'+letter+'</span>');
	});
	// Oh yeah
	$('body').on('keydown', function(e) {
		// Ignore special keys:
		if (e.altKey || e.ctrlKey || e.metaKey) {
			return;
		}
		// Stop normal behaviour for now
		e.preventDefault();
		var   key		= e.keyCode
			, input		= $('.guess-word input.letter[value=]')
			, colour
			, letter , letters
			, word		= ''
			, guess		= ''
			, correct	= 0
			, known		= []
			, unknown	= []
			, i
			;
		
		// Check if this is a key we want to display in the box
		if ( 64 < key && key < 91 ) {
			// lowercase - increment it so that it's a capital
			key	+= 32;
		}
		if ( 96 < key && key < 123 ) {
			letter		= guessword.alphabet[key-97];
			colour		= -1 < guessword.badLetters.indexOf(letter) ? 'bad fixed'
						: -1 < guessword.goodLetters.indexOf(letter) ? 'good fixed'
						: -1 < guessword.assumedBadLetters.indexOf(letter) ? 'bad'
						: -1 < guessword.assumedGoodLetters.indexOf(letter) ? 'good'
						: -1 < guessword.usedLetters.indexOf(letter) ? 'used'
						: '';
			console.log(colour);
			// letter - array the value in:
			input
				.first().val(letter)
				.addClass(colour)
				.next().addClass('focus')
				.siblings().removeClass('focus')
				;
		}
		if ( 8 === key ) {
			// backspace
			if ( ! input.length ) {
				// full boxes require clearing the last one:
				$('.guess-word input:last-child')
					.val('')
					.removeClass('fixed used good bad').addClass('focus')
					.siblings().removeClass('focus');
			}else{
				input.first().prev()
					.val('')
					.removeClass('fixed used good bad').addClass('focus')
					.siblings().removeClass('focus');
			}
		}
		if (13 === key ) {
			// make sure we have all the boxes filled
			if ( ! input.length ) {
				// processing
				$('.guess-word .progress').show();
				// okay - add it to our list with the amount
				letters	= guessword.actualWord.split('');
				$('.guess-word input.letter').each(function(i, input) {
					letter	= $(input).val();
					colour	= -1 < guessword.badLetters.indexOf(letter) ? ' bad fixed'
							: -1 < guessword.goodLetters.indexOf(letter) ? ' good fixed'
							: -1 < guessword.assumedBadLetters.indexOf(letter) ? ' bad'
							: -1 < guessword.assumedGoodLetters.indexOf(letter) ? ' good'
							: -1 < guessword.usedLetters.indexOf(letter) ? ' used'
							: '';
					word	+= letter;
					guess	+= '<span class="letter letter-' + letter + colour + '">' + letter + '</span>';
					if ( -1 < letters.indexOf(letter) ) {
						correct ++;
						letters.splice(letters.indexOf(letter),1);
					}
					// put letters in the known/unknown for automatic red/greens
					if ( -1 < guessword.goodLetters.indexOf(letter) ) {
						known.push(letter);
					}else{
						unknown.push(letter);
					}
				}).val('').removeClass('focus fixed used good bad').first().addClass('focus');
				// but is it a valid word?
				$.ajax({
					  url		: WORDNIK_URL+WORDNIK_DEF_API+word.toLowerCase()+WORDNIK_DEF_ARGS
					, type		: 'GET'
					, dataType	: 'jsonp'
					, cache		: true
					, error		: function(xhr, txt, err) {
						console.log(txt);
						// done processing
						$('.guess-word .progress').hide();
					}
					, success	: function(d) {
						if ( 1 > d.length ) {
							// Invalid word
							console.log('Invalid word: ' + word);
							// done processing
							$('.guess-word .progress').hide();
						}else{
							console.log('Valid word: ' + word);
							// Do we have the word?
							if ( 5 === correct ) {
								if (word === guessword.actualWord) {
									correct	= 'Winner!';
								}
							}
							$('.guessed-words tbody').prepend(
								$('<tr>').append(
										$('<td>').append(guess)
									).append(
										$('<td>').append(correct)
									)
							);
							// Did we get any other letters automatically?
							if ( correct === known.length ) {
								for (i in unknown) {
									letter	= unknown[i];
									if ( 0 > guessword.badLetters.indexOf(letter) ) {
										guessword.badLetters.push(letter);
										$('.letter-'+letter).removeClass('used').addClass('fixed bad');
									}
								}
							}else{
								for (i in unknown) {
									letter	= unknown[i];
									if ( 0 > guessword.usedLetters.indexOf(letter) ) {
										guessword.usedLetters.push(letter);
										$('.letter-'+letter).addClass('used');
									}
								}
							}
							// done processing
							$('.guess-word .progress').hide();
						}
					}
				});
			}else{
				// hmm, perhaps tell them we need a full word
			}
		}
	}).on('click touch','span.letter',function(e) {
		// Just in case it's a link ?
		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();
		var	  target	= $(e.target)
			, letter	= target.html();
		
		// Is this unchangeable?
		if (target.hasClass('fixed')) {
			return;
		}
		// Toggle through
		if (target.hasClass('used')) {
			$('.letter-'+letter).removeClass('used').addClass('good');
			if (-1 < guessword.assumedBadLetters.indexOf(letter)) {
				guessword.assumedBadLetters.splice(guessword.assumedBadLetters.indexOf(letter),1);
			}
			if (0 > guessword.assumedGoodLetters.indexOf(letter)) {
				guessword.assumedGoodLetters.push(letter);
			}
		}else
		if (target.hasClass('good')) {
			$('.letter-'+target.html()).removeClass('good').addClass('bad');
			if (-1 < guessword.assumedGoodLetters.indexOf(letter)) {
				guessword.assumedGoodLetters.splice(guessword.assumedGoodLetters.indexOf(letter),1);
			}
			if (0 > guessword.assumedBadLetters.indexOf(letter)) {
				guessword.assumedBadLetters.push(letter);
			}
		}else
		if (target.hasClass('bad')) {
			$('.letter-'+target.html()).removeClass('bad').addClass('used');
			if (-1 < guessword.assumedBadLetters.indexOf(letter)) {
				guessword.assumedBadLetters.splice(guessword.assumedBadLetters.indexOf(letter),1);
			}
			if (-1 < guessword.assumedGoodLetters.indexOf(letter)) {
				guessword.assumedGoodLetters.splice(guessword.assumedGoodLetters.indexOf(letter),1);
			}
		}
	});
	refresh_word();
});

function wordnik(word) {
	$.ajax({
		  url		: WORDNIK_URL+WORDNIK_DEF_API+word.toLowerCase()+WORDNIK_DEF_ARGS
		, type		: 'GET'
		, dataType	: 'jsonp'
		, cache		: true
		, error		: function(xhr, txt, err) {
			console.log(txt);
		}
		, success	: function(d) {
			console.log(d);
			return d.text;
		}
	});
}

function refresh_word() {
	$('.guess-word .progress').show();
	$.ajax({
		  url		: WORDNIK_URL+WORDNIK_RND
		, type		: 'GET'
		, dataType	: 'jsonp'
		, cache		: false
		, error		: function(xhr, txt, err) {
			console.log(txt);
			// done processing
			$('.guess-word .progress').hide();
		}
		, success	: function(d) {
			var word	= d.word.toUpperCase();
			// Check for double letters
			if (word[0] === word[1]
			||	word[0] === word[2]
			||	word[0] === word[3]
			||	word[0] === word[4]
			||	word[1] === word[2]
			||	word[1] === word[3]
			||	word[1] === word[4]
			||	word[2] === word[3]
			||	word[2] === word[4]
			||	word[3] === word[4]
			||	0 > guessword.alphabet.indexOf(word[0])
			||	0 > guessword.alphabet.indexOf(word[1])
			||	0 > guessword.alphabet.indexOf(word[2])
			||	0 > guessword.alphabet.indexOf(word[3])
			||	0 > guessword.alphabet.indexOf(word[4])) {
				// One of the letters is a double letter, redo.
				console.log('Rejected word: ' + word);
				return refresh_word();
			}
			guessword.actualWord			= word;
			guessword.badLetters			= [];
			guessword.goodLetters			= [];
			guessword.usedLetters			= [];
			guessword.assumedBadLetters		= [];
			guessword.assumedGoodLetters	= [];
			$('.guessed-words tbody').html('');
			$('.letter').removeClass('focus fixed used good bad');
			$('.guess-word input.letter').val('').first().addClass('focus');
			$('.revealed,.definition').html('');
			$('.guess-word .progress').hide();
		}
	});
}
$(function() {
	$('button.refresh').on('click', refresh_word);
	$('button.reveal').on('click', function(e) {
		// processing
		$('.guess-word .progress').show();
		$.ajax({
			  url		: WORDNIK_URL+WORDNIK_DEF_API+guessword.actualWord.toLowerCase()+WORDNIK_DEF_ARGS
			, type		: 'GET'
			, dataType	: 'jsonp'
			, cache		: true
			, error		: function(xhr, txt, err) {
				console.log(txt);
				// done processing
				$('.guess-word .progress').hide();
			}
			, success	: function(d) {
				$('.revealed').html(guessword.actualWord);
				$('.definition').html(d[0] ? d[0].text : 'Unknown');
				// done processing
				$('.guess-word .progress').hide();
			}
		});
	});
});