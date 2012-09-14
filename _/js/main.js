var guessword	= {
	  badLetters	: []
	, goodLetters	: []
	, usedLetters	: []
	, actualWord	: 'COATS'
};

$(function() {
	// Oh yeah
	$('body').on('keydown', function(e) {
		// Ignore special keys:
		if (e.altKey || e.ctrlKey || e.metaKey) {
			return;
		}
		// Stop normal behaviour for now
		e.preventDefault();
		var   key		= e.keyCode
			, input		= $('.guess-word input[value=]')
			, colour
			, letter , letters
			, word		= ''
			, guess		= ''
			, correct	= 0
			, known		= []
			, unknown	= []
			;
		
		// Check if this is a key we want to display in the box
		if ( 64 < key && key < 91 ) {
			// lowercase - increment it so that it's a capital
			key	+= 32;
		}
		if ( 96 < key && key < 123 ) {
			letter		= ([ 'A','B','C','D','E','F','G','H','I','J','K','L','M'
							,'N','O','P','Q','R','S','T','U','V','W','X','Y','Z' ])[key-97];
			colour		= -1 < guessword.badLetters.indexOf(letter) ? 'bad'
						: -1 < guessword.goodLetters.indexOf(letter) ? 'good'
						: -1 < guessword.usedLetters.indexOf(letter) ? 'used'
						: '';
			// letter - array the value in:
			input
				.first().val(letter)
				.addClass(colour)
				.next().focus();
		}
		if ( 8 === key ) {
			// backspace
			input.first().prev().val('').removeClass('used good bad').focus();
			if ( ! input.length ) {
				// full boxes require clearing the last one:
				$('.guess-word input:last-child').val('').removeClass('used good bad').focus();
			}
		}
		if (13 === key ) {
			// make sure we have all the boxes filled
			if ( ! input.length ) {
				// processing
				$('.guess-word .progress').show();
				// perfect, but is it a valid word?
// TO DO - assume yes for now
				// okay - add it to our list with the amount
				letters	= guessword.actualWord.split('');
				$('.guess-word input').each(function(i, input) {
					letter	= $(input).val();
					colour	= -1 < guessword.badLetters.indexOf(letter) ? ' bad'
							: -1 < guessword.goodLetters.indexOf(letter) ? ' good'
							: -1 < guessword.usedLetters.indexOf(letter) ? ' used'
							: '';
					word	+= letter;
					guess	+= '<span class="letter letter-' + letter + colour + '">' + letter + '</span>';
					if ( -1 < letters.indexOf(letter) ) {
						correct ++;
						letters.splice(letters.indexOf(letter),1);
					}
					if ( -1 < guessword.goodLetters.indexOf(letter) ) {
						known	+= letter;
					}else{
						unknown	+= letter;
					}
				}).val('').removeClass('used good bad').first().focus();
				$('.guessed-words tbody').append(
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
							guessword.badLetters += letter;
							$('.letter-'+letter).removeClass('used').addClass('bad');
						}
					}
				}else{
					for (i in unknown) {
						letter	= unknown[i];
						if ( 0 > guessword.usedLetters.indexOf(letter) ) {
							guessword.usedLetters += letter;
							$('.letter-'+letter).addClass('used');
						}
					}
				}
				// done processing
				$('.guess-word .progress').hide();
			}else{
				// hmm, perhaps tell them we need a full word
			}
		}
	});
});