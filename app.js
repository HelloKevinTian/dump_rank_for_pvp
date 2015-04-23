var redis = require("redis")
var client = redis.createClient("25040","10.10.10.72",{"no_ready_check":true});
//var client = redis.createClient("6380","127.0.0.1",{"no_ready_check":false});
	
//  current is the x week
var getWeek = function (date) {
    var onejan = new Date(date.getFullYear(), 0, 1);
    //	delay_day ,such as 3,that means wednesday is the first day of new week
    var delay_day = 3;
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1 + delay_day) / 7);
};
var championship_id = getWeek(new Date()) - 1;

//	zrange z_rank:1 0 1000 withscores
var z_rank = "z_rank_pvp_score:" + championship_id;	
var h_rank = "h_rank_pvp:" + championship_id;	
var range_low = 0;
var range_high = 9999;


client.on("error", function (err) {
    console.log("Error " + err);
});
 
client.on("connect", runSample);
 
var rank = [];
var score;
var phone;
function runSample() {
	var args1 = [ z_rank, range_low, range_high, 'withscores' ];
    client.zrevrange(args1, function (err, reply) {
		for(var i = 0; i < reply.length; ++i){
			var contact = new Object();
			contact.device_id = reply[i++];
			contact.score = reply[i];
			rank.push(contact);
		}

		var args1 = [];
		args1.push(h_rank);
		for(var j = 0; j < rank.length; ++j){
			args1.push(rank[j].device_id);
		}
		client.hmget(args1, function (err, reply1) {
			var index = 0;
			for(var v in reply1){
				rank[index].rank = index + 1;
				//delete rank[index].device_id;
				rank[index].phone = JSON.parse(reply1[v]) ? JSON.parse(reply1[v]).phone_number:null;
				rank[index].channel = JSON.parse(reply1[v]) ? JSON.parse(reply1[v]).channel:null;
				rank[index].version = JSON.parse(reply1[v]) ? JSON.parse(reply1[v]).version:null;
				rank[index].nickname = JSON.parse(reply1[v]) ? JSON.parse(reply1[v]).nickname:null;
				index++;
			}
			require("fs").writeFile('rank_for_pvp.json', JSON.stringify(rank), 'utf8', function(err){
				if(err){
					console.log('failed');
				}else{
					console.log('ok');
				}
			});
			console.log(rank);
		});
    });
}
