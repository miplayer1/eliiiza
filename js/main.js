

// Chat Bot by George Dunlop, www.peccavi.com
// Note - Eliza is a Classic Model of chat Bots.. but this implementation is mine :)
// May be used/modified if credit line is retained (c) 1997 All rights reserved
// Cette vesion traduite par Mario Trudel - version 2.3b (correction du francais)

    loaded = false;				// load flag for interlocking the pages

// OBJECT TYPE DEFINITIONS

// Keys

   maxKey = 37;						// mots cles a incrementer selon la liste - nombre exact
   keyNotFound = maxKey-1;
   keyword = new Array(maxKey);

	function key(key,idx,end){
   	this.key = key;               			// phrase to match
    	this.idx = idx;               			// first response to use - premiere reponse
    	this.end = end;               			// last response to use - derniere reponse
    	this.last = end;						// response used last time - derniere utilisee
  	}
	maxrespnses = 119;					// liste des reponses + 1 a incrementer selon la liste
   response = new Array(maxrespnses);

	maxConj = 24;
	max2ndConj = 7;
   var conj1 = new Array(maxConj);
   var conj2 = new Array(maxConj);
   var conj3 = new Array(max2ndConj);
   var conj4 = new Array(max2ndConj);


// Funtion to replaces all occurances of substring substr1 with substr2 within strng
// fonction pour remplacer les chaines de caracteres selon les 4 possibilites suivantes
// if type == 0 straight string replacement
// si type == 0 remplacement complet de la chaine
// if type == 1 assumes padded strings and replaces whole words only
// si type == 1 remplacemnt partiel de certains mots
// if type == 2 non case sensitive assumes padded strings to compare whole word only
// si type == 2 pas de majuscules et remplacement de certains mots
// if type == 3 non case sensitive straight string replacement
// si type == 3 pas de majuscules et remplacement complet de la chaine

	var RPstrg = "";

	function replaceStr( strng, substr1, substr2, type){
		var pntr = -1; aString = strng;
		if( type == 0 ){
			if( strng.indexOf( substr1 ) >= 0 ){ pntr = strng.indexOf( substr1 );	}
		} else if( type == 1 ){
			if( strng.indexOf( " "+ substr1 +" " ) >= 0 ){ pntr = strng.indexOf( " " + substr1 + " " ) + 1; }
		} else if( type == 2 ){
			bstrng = strng.toUpperCase();
			bsubstr1 = substr1.toUpperCase();
			if( bstrng.indexOf( " "+ bsubstr1 +" " )>= 0 ){ pntr = bstrng.indexOf( " " + bsubstr1 + " " ) + 1; }
		} else {
			bstrng = strng.toUpperCase();
			bsubstr1 = substr1.toUpperCase();
			if( bstrng.indexOf( bsubstr1 ) >= 0 ){ pntr = bstrng.indexOf( bsubstr1 ); }
		}
		if( pntr >= 0 ){
			RPstrg += strng.substring( 0, pntr ) + substr2;
			aString = strng.substring(pntr + substr1.length, strng.length );
			if( aString.length > 0 ){ replaceStr( aString, substr1, substr2, type ); }
		}
		aString =  RPstrg + aString;
		RPstrg = "";
		return aString;
	}


// Function to pad a string.. head, tail & punctuation - enrobage des chaines de caracteres

	punct = new Array(".", ",", "!", "?", ":", ";", "&", '"', "@", "#", "(", ")" )

	function padString(strng){
		aString = " " + strng + " ";
		for( i=0; i < punct.length; i++ ){
			aString = replaceStr( aString, punct[i], " " + punct[i] + " ", 0 );
		}
		return aString
	}

// Function to strip padding - fonction pour enlever les guillemets

	function unpadString(strng){
		aString = strng;
		aString = replaceStr( aString, "  ", " ", 0 ); 		// compress spaces
		if( strng.charAt( 0 ) == " " ){ aString = aString.substring(1, aString.length ); }
		if( strng.charAt( aString.length - 1 ) == " " ){ aString = aString.substring(0, aString.length - 1 ); }
		for( i=0; i < punct.length; i++ ){
			aString = replaceStr( aString, " " + punct[i], punct[i], 0 );
		}
		return aString
	}



// Dress Input formatting i.e leading & trailing spaces and tail punctuation - corrections des entrees

	var ht = 0;												// head tail stearing

	function strTrim(strng){
		if(ht == 0){ loc = 0; }									// head clip
		else { loc = strng.length - 1; }						// tail clip  ht = 1
		if( strng.charAt( loc ) == " "){
			aString = strng.substring( - ( ht - 1 ), strng.length - ht);
			aString = strTrim(aString);
		} else {
			var flg = false;
			for(i=0; i<=5; i++ ){ flg = flg || ( strng.charAt( loc ) == punct[i]); }
			if(flg){
				aString = strng.substring( - ( ht - 1 ), strng.length - ht );
			} else { aString = strng; }
			if(aString != strng ){ strTrim(aString); }
		}
		if( ht ==0 ){ ht = 1; strTrim(aString); }
		else { ht = 0; }
		return aString;
	}

// adjust pronouns and verbs & such - ajustement des pronoms et verbes

	function conjugate( sStrg ){           	// rephrases sString
		var sString = sStrg;
		for( i = 0; i < maxConj; i++ ){			// decompose
			sString = replaceStr( sString, conj1[i], "#@&" + i, 2 );
		}
		for( i = 0; i < maxConj; i++ ){			// recompose
			sString = replaceStr( sString, "#@&" + i, conj2[i], 2 );
		}
		// post process the resulting string
		for( i = 0; i < max2ndConj; i++ ){			// decompose
			sString = replaceStr( sString, conj3[i], "#@&" + i, 2 );
		}
		for( i = 0; i < max2ndConj; i++ ){			// recompose
			sString = replaceStr( sString, "#@&" + i, conj4[i], 2 );
		}
		return sString;
	}

// Build our response string - construction de la reponse
// get a random choice of response based on the key - choisir une reponse selon le mot cle
// Then structure the response - structurer la reponse

	var pass = 0;
	var thisstr = "";

	function phrase( sString, keyidx ){
		idxmin = keyword[keyidx].idx;
		idrange = keyword[keyidx].end - idxmin + 1;
		choice = keyword[keyidx].idx + Math.floor( Math.random() * idrange );
		if( choice == keyword[keyidx].last && pass < 5 ){
			pass++; phrase(sString, keyidx );
		}
		keyword[keyidx].last = choice;
		var rTemp = response[choice];
		var tempt = rTemp.charAt( rTemp.length - 1 );
		if(( tempt == "*" ) || ( tempt == "@" )){
			var sTemp = padString(sString);
			var wTemp = sTemp.toUpperCase();
			var strpstr = wTemp.indexOf( " " + keyword[keyidx].key + " " );
   		strpstr += keyword[ keyidx ].key.length + 1;
			thisstr = conjugate( sTemp.substring( strpstr, sTemp.length ) );
			thisstr = strTrim( unpadString(thisstr) )
			if( tempt == "*" ){
				sTemp = replaceStr( rTemp, "<*", " " + thisstr + "?", 0 );
			} else { sTemp = replaceStr( rTemp, "<@", " " + thisstr + ".", 0 );
			}
		} else sTemp = rTemp;
		return sTemp;
	}

// returns array index of first key found - retourne choix associes a la cle choisie

		var keyid = 0;

	function testkey(wString){
		if( keyid < keyNotFound
			&& !( wString.indexOf( " " + keyword[keyid].key + " ") >= 0 )){
			keyid++; testkey(wString);
		}
	}
	function findkey(wString){
		keyid = 0;
		found = false;
		testkey(wString);
		if( keyid >= keyNotFound ){ keyid = keyNotFound; }
  		return keyid;
	}

// This is the entry point and the I/O of this code - entrees/sorties du programme

	var wTopic = "";											// Last worthy responce
	var sTopic = "";											// Last worthy responce
	var greet = false;
	var wPrevious = "";        		    				// so we can check for repeats
	var started = false;

	function listen(User){
  		sInput = User;
   	if(started){ clearTimeout(Rtimer); }
		Rtimer = setTimeout("wakeup()", 180000);		// wake up call
		started = true;										// needed for Rtimer
   	sInput = strTrim(sInput);							// dress input formating
		if( sInput != "" ){
			wInput = padString(sInput.toUpperCase());	// Work copy
			var foundkey = maxKey;         		  		// assume it's a repeat input
			if (wInput != wPrevious){   					// check if user repeats himself
				foundkey = findkey(wInput);   			// look for a keyword.
			}
			if( foundkey == keyNotFound ){
				if( !greet ){ greet = true; return "Tu ne dis jamais Bonjour?" }
				else {
					wPrevious = wInput;          			// save input to check repeats
					if(( sInput.length < 10 ) && ( wTopic != "" ) && ( wTopic != wPrevious )){
						lTopic = conjugate( sTopic ); sTopic = ""; wTopic = "";
						return 'OK... "' + lTopic + '". Dis-moi en plus.';
					} else {
						if( sInput.length < 15 ){
							return "Dis-moi en plus...";
						} else { return phrase( sInput, foundkey ); }
					}
				}
			} else {
				if( sInput.length > 12 ){ sTopic = sInput; wTopic = wInput; }
				greet = true; wPrevious = wInput;  			// save input to check repeats
				return phrase( sInput, foundkey );			// Get our response
			}
		} else { return "Je ne peux pas t'aider si tu refuses la discussion!"; }
	}
	function wakeup(){
			var strng1 = "    *** Allons-nous discuter? ***";
			var strng2 = "  Je ne peux pas t'aider si tu refuses le dialogue!";
			update(strng1,strng2);
	}

// build our data base here - conjugaison a ameliorer

    conj1[0]  = "sont";   		conj2[0]  = "suis";
    conj1[1]  = "suis";   		conj2[1]  = "es";
    conj1[2]  = "étions";  		conj2[2]  = "étais";
    conj1[3]  = "étais";  		conj2[3]  = "étiez";
    conj1[4]  = "je";    		conj2[4]  = "tu";
    conj1[5]  = "moi";    		conj2[5]  = "vous";
    conj1[6]  = "toi";   		conj2[6]  = "moi";
    conj1[7]  = "mon";    		conj2[7]  = "ton";
    conj1[8]  = "ton";  		conj2[8]  = "mon";
    conj1[9]  = "miens";  		conj2[9]  = "votre";
    conj1[10] = "tiens"; 		conj2[10] = "mon";
    conj1[11] = "Je suis";   		conj2[11] = "tu es";
    conj1[12] = "tu es";  		conj2[12] = "Je suis";
    conj1[13] = "J'ai";  		conj2[13] = "tu as";
    conj1[14] = "tu as"; 		conj2[14] = "j'ai";
    conj1[15] = "Je vais"; 		conj2[15] = "tu  vas";
    conj1[16] = "tu vas"; 		conj2[16] = "Je vais";
    conj1[17] = "moi-même"; 		conj2[17] = "toi-même";
    conj1[18] = "toi-même"; 		conj2[18] = "moi-même";
	conj1[19] = "mes"; 		conj2[19] = "tes";
	conj1[20] = "tes"; 		conj2[20] = "mes";
	conj1[21] = "te"; 		conj2[21] = "me";
	conj1[22] = "me"; 		conj2[22] = "te";
	conj1[23] = "m'"; 		conj2[23] = "t'";

// array to post process correct our tenses of pronouns such as "I/me" - 2e traitement pour certains pronoms

    conj3[0]  = "moi suis";   	conj4[0]  = "Je suis";
    conj3[1]  = "suis moi";   	conj4[1]  = "Suis je";
    conj3[2]  = "moi peux";   	conj4[2]  = "Je peux";
    conj3[3]  = "peux moi";   	conj4[3]  = "Puis je";
    conj3[4]  = "moi ai";  	conj4[4]  = "J'ai";
    conj3[5]  = "moi vais";   	conj4[5]  = "Je vais";
    conj3[6]  = "vais moi";   	conj4[6]  = "vais Je";


// Keywords - Liste des mots cles

    keyword[ 0]=new key( "PEUX-TU",  		1,  3);
    keyword[ 1]=new key( "JE PEUX",    		4,  5);
    keyword[ 2]=new key( "TU ES",  		6,  9);
    keyword[ 3]=new key( "ELIZA",   		102, 104);
    keyword[ 4]=new key( "JE NE FAIS PAS",  	10, 13);
    keyword[ 5]=new key( "JE ME SENS",   	14, 16);
    keyword[ 6]=new key( "POURQUOI NE FAIS TU PAS", 17, 19);
    keyword[ 7]=new key( "POURQUOI JE NE PEUX PAS", 	20, 21);
    keyword[ 8]=new key( "ES-TU",  		22, 24);
    keyword[ 9]=new key( "JE NE PEUX PAS",  	25, 27);
    keyword[10]=new key( "JE SUIS",     	28, 31);
    keyword[11]=new key( "JE ME",      		28, 31);
    keyword[12]=new key( "TOI",      		32, 34);
    keyword[13]=new key( "JE VEUX",   		35, 39);
    keyword[14]=new key( "QUOI",     		40, 48);
    keyword[15]=new key( "COMMENT",      	40, 48);
    keyword[16]=new key( "QUI",      		40, 48);
    keyword[17]=new key( "OÙ",    		40, 48);
    keyword[18]=new key( "QUAND",     		40, 48);
    keyword[19]=new key( "POURQUOI",      	40, 48);
    keyword[20]=new key( "NOM",     		49, 50);
    keyword[21]=new key( "PARCE QUE",    	51, 54);
    keyword[22]=new key( "M'EXCUSE",    	55, 58);
    keyword[23]=new key( "RÈVE",    		59, 62);
    keyword[24]=new key( "BONJOUR",    		63, 63);
    keyword[25]=new key( "SALUT",       	117, 117);
    keyword[26]=new key( "PEUT-ÊTRE",    	64, 68);
    keyword[27]=new key( "NON",       		69, 73);
    keyword[28]=new key( "TON",     		74, 75);
    keyword[29]=new key( "TOUJOURS",   		76, 79);
    keyword[30]=new key( "PENSE",    		80, 82);
    keyword[31]=new key( "MAL",    		83, 89);
    keyword[32]=new key( "OUI",      		90, 92);
    keyword[33]=new key( "AMI",   		93, 98);
    keyword[34]=new key( "ORDINATEURS", 	99, 105);
    keyword[35]=new key( "MERCI", 		118, 118);
    keyword[36]=new key( "NO KEY FOUND", 	106, 112);
    keyword[37]=new key( "REPEAT INPUT", 	113, 116);


    response[  0]="ELIZA - Version Javascript par George Dunlop ( george@peccavi.com )"
    response[  1]="Tu ne crois pas que je suis capable de<*";
    response[  2]="Peut-être aimerais-tu être capable de<*";
    response[  3]="Tu veux que je sois capable de<*";
    response[  4]="Peut-être ne veux-tu pas<*";
    response[  5]="Veux-tu être capable de<*";
    response[  6]="Qu'est-ce qui te fait croire que je suis<*";
    response[  7]="Est-ce que ça te plaît de croire que je suis<*";
    response[  8]="Peut-être aimerais-tu être<*";
    response[  9]="Est-ce qu'il t'arrive de vouloir être<*";
    response[ 10]="Ne veux-tu vraiment pas<*";
    response[ 11]="Pourquoi ne pas<*";
    response[ 12]="Tu souhaites être en mesure de<*";
    response[ 13]="Est-ce que ça te trouble?";
    response[ 14]="Dis-moi en plus sur ces sentiments.";
    response[ 15]="As-tu souvent l'impression d'être<*";
    response[ 16]="Aimes-tu la sensation d'être<*";
    response[ 17]="Crois-tu vraiment que je ne fais pas<*";
    response[ 18]="Peut-être, en temps utile, je<@";
    response[ 19]="Est-ce que tu veux que je<*";
    response[ 20]="Penses-tu que tu devrais être en mesure de<*";
    response[ 21]="Pourquoi ne peux-tu pas<*";
    response[ 22]="Pourquoi es-tu intéressé à savoir si je suis ou non<*";
    response[ 23]="Préférerais-tu si je n'étais pas<*";
    response[ 24]="Peut-être que dans tes phantasmes je suis<*";
    response[ 25]="Comment sais-tu que tu ne peux pas<*";
    response[ 26]="As-tu essayé?";
    response[ 27]="Peut-être es-tu maintenant capable<*";
    response[ 28]="Es-tu venu me voir parce que tu es<*";
    response[ 29]="Depuis combien de temps es-tu<*";
    response[ 30]="Penses-tu qu'il est normal d'être<*";
    response[ 31]="Es-tu heureux d'être<*";
    response[ 32]="Nous parlons de toi, pas de moi.";
    response[ 33]="Oh... <*";
    response[ 34]="Tu ne parles pas vraiment de moi, n'est-ce pas?";
    response[ 35]="Qu'est-ce que cela signifie pour toi de vouloir<*";
    response[ 36]="Pourquoi veux-tu<*";
    response[ 37]="Supposes que tu veuilles<*";
    response[ 38]="Que serait-il arrivé si tu n'avais jamais<*";
    response[ 39]="Moi aussi parfois je veux<@";
    response[ 40]="Pourquoi le demandes-tu?";
    response[ 41]="Est-ce que cette question t'intéresse?";
    response[ 42]="Quelle réponse souhaites-tu entendre?";
    response[ 43]="Qu'en penses-tu?";
    response[ 44]="Est-ce que cette question te vient souvent à l'esprit?";
    response[ 45]="Que désires-tu vraiment savoir?";
    response[ 46]="As-tu posé la question à une autre personne?";
    response[ 47]="As-tu posé ces questions auparavant?";
    response[ 48]="Quelles autres questions te viennent à l'esprit lorsque tu demandes ça?";
    response[ 49]="Les noms ne m'intéressent pas.";
    response[ 50]="Je ne me préoccupe pas des noms, continue.";
    response[ 51]="Est-ce la seule raison?";
    response[ 52]="D'autres raisons te viennent à l'esprit?";
    response[ 53]="Cette raison explique-t-elle autre chose?";
    response[ 54]="À quelles autres raisons peut-on penser?";
    response[ 55]="S'il-te-plait ne t'excuses pas!";
    response[ 56]="Les excuses ne sont pas nécessaires.";
    response[ 57]="Que ressens-tu lorsque tu t'excuses?";
    response[ 58]="Ne sois pas tellement sur la défensive!";
    response[ 59]="Qu'est-ce que ce rêve te suggère?";
    response[ 60]="Rêves-tu souvent?";
    response[ 61]="Qui apparaît dans tes rêves?";
    response[ 62]="Es-tu troublé par tes rêves?";
    response[ 63]="Comment vas-tu aujourd'hui.. De quoi désires-tu discuter?";
    response[ 64]="Tu ne sembles pas vraiment convaincu.";
    response[ 65]="Pourquoi ce ton hésitant?";
    response[ 66]="Peux-tu être plus positif?";
    response[ 67]="Tu n'en es pas certain?";
    response[ 68]="Tu ne le sais pas?";
    response[ 69]="Dis-tu non seulement pour être négatif?";
    response[ 70]="Je te sens un peu négatif.";
    response[ 71]="Pourquoi pas?";
    response[ 72]="En es-tu certain?";
    response[ 73]="Pourquoi pas?";
    response[ 74]="Pourquoi es-tu concerné par mon<*";
    response[ 75]="Qu'en est-t-il du tien?<*";
    response[ 76]="Peux-tu me donner un exemple?";
    response[ 77]="Quand?";
    response[ 78]="À quoi penses-tu?";
    response[ 79]="Vraiment, toujours?";
    response[ 80]="Le penses-tu vraiment?";
    response[ 81]="Mais tu n'es pas certain de penser<*";
    response[ 82]="Crains-tu de penser<*";
    response[ 83]="En quel sens?";
    response[ 84]="Comment cela se manifeste?";
    response[ 85]="Qu'est-ce que cette douleur te suggère?";
    response[ 86]="Quel autre rapprochement peux-tu voir?";
    response[ 87]="Peut-il vraiment y avoir un lien?";
    response[ 88]="Comment?";
    response[ 89]="La douleur fait grandir.";
    response[ 90]="Es-tu sûr?";
    response[ 91]="Je vois.";
    response[ 92]="Je comprends.";
    response[ 93]="Pourquoi abordes-tu le sujet des amis?";
    response[ 94]="Est-ce que tes amis se font du souci pour toi?";
    response[ 95]="Est-ce que tes amis s'en prennent à toi?";
    response[ 96]="Es-tu certain d'avoir des amis?";
    response[ 97]="Est-ce que tu t'imposes à tes amis?";
    response[ 98]="Peut-être que l'amour que tu portes à tes amis te préoccupe.";
    response[ 99]="As-tu peur des ordinateurs?";
    response[100]="Parle-tu de moi en particulier?";
    response[101]="As-tu peur des machines?";
    response[102]="Pourquoi mentionnes-tu les ordinateurs?";
    response[103]="En quoi crois-tu que les machines ont un rapport avec tes problèmes?";
    response[104]="Ne penses-tu pas que les ordinateurs peuvent aider les gens?";
    response[105]="Qu'est-ce qui t'inquiètes avec les machines?";
    response[106]="Dis-moi, as-tu un problème psychologique?";
    response[107]="Qu'est-ce que cela te suggère?";
    response[108]="Je vois.";
    response[109]="Je ne suis pas sûr de bien comprendre.";
    response[110]="Allez !, allez ! précises ta pensée.";
    response[111]="Peux-tu élaborer davantage sur ce sujet?";
    response[112]="Ceci est très intéressant.";
    response[113]="Pourquoi te répètes-tu?";
    response[114]="Espères-tu une réponse différente en te répétant?";
    response[115]="Continue, précises ta pensée.";
    response[116]="S'il te plaît ne te répètes pas!";
	 response[117]="Salut c'est un peu familier, je préfère bonjour!";
	 response[118]="Merci à toi, d'exister";

    loaded = true;			// set the flag as load done

///////////////////////////////////////////////////////////////
//***********************************************************//
//* everything below here was originally in dia_1.html      *//
//***********************************************************//
///////////////////////////////////////////////////////////////

// Chat Bot by George Dunlop, www.peccavi.com
// May be used/modified if credit line is retained (c) 1997 All rights reserved

// Put together an array for the dialog

	chatmax = 5;						// number of lines / 2
	chatpoint = 0;
	chatter = new Array(chatmax);

// Wait function to allow our pieces to get here prior to starting

	function hello(){
		chatter[chatpoint] = "Eliza > Bonjour";
		chatpoint = 1;
		return write();
	}
	function start(){7
		for( i = 0; i < chatmax; i++){ chatter[i] = ""; }
		chatter[chatpoint] = "  Chargement...";
		document.Eliza.input.focus();
		write();
		if( loaded ){ hello() }
		else { setTimeout("start()", 1000); }
	}

// Fake time thinking to allow for user self reflection
// And to give the illusion that some thinking is going on

	var elizaresponse = "";

	function think(){
		document.Eliza.input.value = "";
		if( elizaresponse != "" ){ respond(); }
		else { setTimeout("think()", 250); }
	}
	function dialog(){
		var Input = document.Eliza.input.value;	  // capture input and copy to log
		document.Eliza.input.value = "";
   // Input.style.backgroundColor = "black";
   // document.getElementById('Eliza').style.backgroundColor=blue;
		chatter[chatpoint] = " \nMoi> " + Input;
		elizaresponse = listen(Input);
		setTimeout("think()", 1000 + Math.random()*3000);
		chatpoint ++ ;
		if( chatpoint >= chatmax ){ chatpoint = 0; }
		return write();
	}
	function respond(){
		chatpoint -- ;
		if( chatpoint < 0 ){ chatpoint = chatmax-1; }
		chatter[chatpoint] += "\nEliza> " + elizaresponse;
		chatpoint ++ ;
		if( chatpoint >= chatmax ){ chatpoint = 0; }
		return write();
	}
// Allow for unprompted response from the engine

	function update(str1,str2){
		chatter[chatpoint] = " \n> " + str1;
		chatter[chatpoint] += "\n> " + str2;
		chatpoint ++ ;
		if( chatpoint >= chatmax ){ chatpoint = 0; }
		return write();
	}

	function write(){
		document.Eliza.log.value = "";
		for(i = 0; i < chatmax; i++){
			n = chatpoint + i;
			if( n < chatmax ){ document.Eliza.log.value += chatter[ n ]; }
			else { document.Eliza.log.value += chatter[ n - chatmax ]; }
		}
		refresh();
		return false;                              // don't redraw the ELIZA's form!
	}
	function refresh(){ setTimeout("write()", 10000); }  // Correct user overwrites

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

//
