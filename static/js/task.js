/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);
coach_on = true

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
// they are not used in the stroop code but may be useful to you

//http://128.32.164.66/
address = '128.32.164.66'
console.log("CONDITIONS ",condition," ",counterbalance)

// All pages to be loaded
var pages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-4.html",
	"instructions/instruct-5.html",
	"instructions/instruct-4_l.html",
	"instructions/instruct-ready.html",
	"winter_game_nc.html",
	"summer_game.html",
	"final_game.html",
	"winter_game_ec.html",
	"winter_game_rc.html",
	"postquestionnaire.html",
	"postquestionnaire_nc.html"
];

psiTurk.preloadPages(pages);



var instructionPages_nc = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"summer_game.html",
	"instructions/instruct-3.html",
	"winter_game_nc.html",
	"instructions/instruct-5_nc.html",
	"final_game.html"

	
];

var instructionPages_ec = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"summer_game.html",
	"instructions/instruct-3.html",
	"instructions/instruct-4.html",
	"winter_game_ec.html",
	"instructions/instruct-5.html",
	"final_game.html"

	
];

var instructionPages_rc = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"summer_game.html",
	"instructions/instruct-3.html",
	"instructions/instruct-4_l.html",
	"winter_game_rc.html",
	"instructions/instruct-5.html",
	"final_game.html"
];




/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/


questions = false
var CarExperiment = function() {

	questions = true
	
	
};

wkrID =  psiTurk.taskdata.get('workerId')

/****************
* Questionnaire *
****************/

var Questionnaire = function() {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";
	var responses = []; // create an empty array
	responses.push({
		key: "ID",
		value: wkrID
	})
	responses.push({
		key: "condition",
		value: condition
	})
	
	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			console.log("TEXT INPUT "+this.value)
			responses.push({
				key:   this.id,
				value: this.value
			});
			psiTurk.recordUnstructuredData(this.id, this.value);

		});
		$('select').each( function(i, val) {
			responses.push({
				key:   this.id,
				value: this.value
			});

			psiTurk.recordUnstructuredData(this.name, this.value);		
		});

	};

	prompt_resubmit = function() {
		replaceBody(error_message);
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		replaceBody("<h1>Trying to resubmit...</h1>");
		reprompt = setTimeout(prompt_resubmit, 10000);
		
		psiTurk.saveData({
			success: function() {
			    clearInterval(reprompt); 
                psiTurk.computeBonus('compute_bonus', function(){finish()}); 
			}, 
			error: prompt_resubmit
		});
	};

	// Load the questionnaire snippet 
	 if(condition == 0){
	 	psiTurk.showPage('postquestionnaire_nc.html');
	 }
	 else{
		psiTurk.showPage('postquestionnaire.html');
	}

	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});
	
	$("#next").click(function () {
	    record_responses();
	    $.ajax('http://'+address+':5000/save_data', {
                type: "GET",
                data: responses
                });



	    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() { 
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
            }, 
            error: prompt_resubmit});
	});
    
	
};

// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
$(window).load( function(){

	//condition = 1
	if(condition == 0){
		psiTurk.doInstructions(
			instructionPages_nc, // a list of pages you want to display in sequence
			function() { currentview = new Questionnaire(); } 
		);
	}
	else if(condition == 1){
		psiTurk.doInstructions(
			instructionPages_rc, // a list of pages you want to display in sequence
			function() { currentview = new Questionnaire(); } 
		);
	}
	else{
		psiTurk.doInstructions(
			instructionPages_ec, // a list of pages you want to display in sequence
			function() { currentview = new Questionnaire(); } 
		);
	}

    //psiTurk.doInstructions(
    //	gamePage
    //);
    //psiTurk.showPage('winter_game.html');

});
