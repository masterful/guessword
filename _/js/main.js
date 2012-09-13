$(function() {
	// Oh yeah
	$('body').on('keypress', function(e) {
		// Stop normal behaviour for now
		e.preventDefault();
		var   key		= e.keyCode
			, letter	= [  'A','B','C','D','E','F','G','H','I','J','K','L','M'
							,'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'  ]
			, input		= $('.guess-word input[value=]').first();
		
		// Check if this is a key we want to display in the box
		if ( 64 < key && key < 91 ) {
			// lowercase - increment it so that it's a capital
			key	+= 32;
		}
		if ( 96 < key && key < 123 ) {
			// letter - array the value in:
			input.val(letter[key-97]).focus();
		}
	});
});