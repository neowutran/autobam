const Slash = require('slash');

module.exports = function AutoBam(dispatch){
    const slash = new Slash(dispatch);

    let enabled = false;
	let intervalId = 0;
	let myGuildId = 0;
	
	function setEnable(value){
		if(value === enabled){console.info("bam, setEnable dismissed.");return;}
		enabled = value;
		let status =  (enabled ? 'enabled' : 'disabled')
		slash.print('[loot] ' + status);
		console.info("bam: "+status);
		if(enabled === true){
			tryGetQuest();
		}else{
			clearInterval(intervalId);
		}	
	}
	
    slash.on('bam', (args) => {
		console.info("bam: slash");
		if(enabled === true){
			setEnable(false);		
		}else{
			setEnable(true);		
		}
    })
	
    function tryGetQuest(){	
		console.info("bam start try quest");
		var intervalTime = Math.floor((Math.random() * 10) + 1) + 60;
		intervalId = setInterval(() => { 
			 dispatch.toServer('cRequestGuildInfo', {
                 guildId: myGuildId, 
				 type: 6
			 });	
		}, intervalTime); 
    }
	
	dispatch.hook('sGuildInfo', (event) => {
		myGuildId = event.id;
		return true;
	});
	
	dispatch.hook('sGuildQuestList', (event) => {
		if(enabled === false){return true;}
		for(var i = 0; i < event.quests.length ; i++){
			for(var j = 0; j < event.quests[i].targets.length; j++){
				if(parseInt(event.quests[i].targets[j].total) === 1){
					console.info("bam quest found, sending accept");
					setEnable(false);
					dispatch.toServer('cRequestStartGuildQuest', {
						questId: event.quests[i].id
					});
					return false;
				}
			}
		}
		return false;
	});
}
