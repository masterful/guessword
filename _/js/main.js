var guessword	= {
	  badLetters	: ['A', 'S']
	, goodLetters	: ['T', 'N']
};

$(function() {
	// Oh yeah
	$('body').on('keydown', function(e) {
		// Stop normal behaviour for now
		e.preventDefault();
		var   key		= e.keyCode
			, input		= $('.guess-word input[value=]')
			, colour
			, letter
			, word		= ''
			;
		
		// Check if this is a key we want to display in the box
		if ( 64 < key && key < 91 ) {
			// lowercase - increment it so that it's a capital
			key	+= 32;
		}
		if ( 96 < key && key < 123 ) {
			letter		= ([ 'A','B','C','D','E','F','G','H','I','J','K','L','M'
							,'N','O','P','Q','R','S','T','U','V','W','X','Y','Z' ])[key-97];
			colour		= -1 < $.inArray(letter, guessword.badLetters) ? 'bad'
						: -1 < $.inArray(letter, guessword.goodLetters) ? 'good'
						: '';
			// letter - array the value in:
			input
				.first().val(letter)
				.addClass(colour)
				.next().focus();
		}
		if ( 8 === key ) {
			// backspace
			input.first().prev().val('').removeClass('good bad').focus();
			if ( ! input.length ) {
				// full boxes require clearing the last one:
				$('.guess-word input:last-child').val('').removeClass('good bad').focus();
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
				$('.guess-word input').each(function(i, input) {
					word	+= $(input).val();
				}).val('').removeClass('good bad').first().focus();
				$('.guessed-words tbody').append(
					$('<tr>').append(
							$('<td>').append(word)
						).append(
							$('<td>').append('?')
						)
				);
				// done processing
				$('.guess-word .progress').hide();
			}else{
				// hmm, perhaps tell them we need a full word
			}
		}
	});
});