
var API_KEY='xDJgvTXNa6Z4GjT5iSRr6Zbs4vH2';
var match_ids=[];
var types=[
  'T20I',
  'WomensT20I',
  'WomensODI',
  'ODI',
];

$(document).ready(function() {
  getdata();
  setInterval(getdata,300*1000);
});

function showModal(element)
{
  // $('.modal-title').html(element.innerHTML);
  $('#score').children().remove();
  $('#score').html("");
  var squad1=new Array(10);
  var squad2=new Array(10);
  var uniqueid=element.id;
  $('#squad1list').children().remove();
  $('#squad2list').children().remove();

  $.ajax({
    url: "https://cricapi.com/api/fantasySquad",
    data: {
      apikey:API_KEY,
      unique_id:uniqueid,
    },
    success: function(response){
      console.log(response['squad'][0]['name']);
      $('#team1').html(response['squad'][0]['name']);
      $('#team2').html(response['squad'][1]['name']);

      response['squad']['0']['players'].forEach(function(val){
        var temp=new Array();
        temp.push(val['name']);
        temp.push(val['pid']);
        squad1.push(temp);
      });

      squad1.forEach(function(val){
        $('#squad1list').append('<li>' + val[0] + '</li>');
      });

      response['squad']['1']['players'].forEach(function(val){
        var temp=new Array();
        temp.push(val['name']);
        temp.push(val['pid']);
        squad2.push(temp);
      });

      squad2.forEach(function(val){
        $('#squad2list').append('<li>' + val[0] + '</li>');
      });

    },
  });
  $('#myModal').modal('show');
  get_match_status(element.id,squad1,squad2);
}

function checktype(val)
{
  return types.includes(val['type']);
}

function current(val)
{
  var d = new Date();
  return val['date'].toString().slice(0,10) == d.toISOString().slice(0,10);
}

function getdata()
{
    $('#match-list').children().remove();
    var matchShow = [];
    match_ids=[];
		$.ajax({
			url: "https://cricapi.com/api/matches",
			data: {
				apikey:API_KEY,
			},
			success: function(response){
        response['matches']=response['matches'].filter(checktype);
        response['matches']=response['matches'].filter(current);
        response['matches'].forEach(function(val){
          match_ids.push(val['unique_id']);
          matchShow.push(val['team-2'] + '  vs  ' + val['team-1']);
        });

        for(var i=0;i<matchShow.length;i=i+1)
        {
          $("#match-list").append(`<li><a id="${match_ids[i]}" href="#" onclick="showModal(this)">` + matchShow[i] + '</a></li>');
        }

			}
		});
}

function get_match_status(matchId)
{
  $.ajax({
    url:"https://cricapi.com/api/cricketScore",
    data:{
      apikey:API_KEY,
      unique_id:matchId,
    },
    success:function(response){
      if(response['matchStarted']==true)
      {
        $('#score').children().remove();
        $('#score').append('<h5 style="color:green">' + response['description'] + '</h5>');
        get_match_details(matchId);
      }
      else{
        $('#score').children().remove();
        $('#score').append('<h5 style="color:red"> Match has not yet Started </h5>');
      }
    },
  });
}

function get_match_details(matchId,squad1,squad2)
{
    $.ajax({
      url:"https://cricapi.com/api/fantasySummary" ,
      data:{
        apikey:API_KEY,
        unique_id:matchId,
      },
      success:function(response){
          response['data']['batting'].forEach(function(val){
            $('#score').append('<hr> <h6>' + val['title'] + '(Batting)' + '</h6>');
            val['scores'].forEach(function(newval){
              $('#score').append('<li>' + newval['batsman'] + ' - ' + '<b>Status: </b> ' + newval['dismissal-info'] + '  ');
              $('#score').append('<b>Runs: </b>' + newval['R'] + `(${newval['B']})` + '</li><br>');
            });
          });

          response['data']['bowling'].forEach(function(val){
            $('#score').append('<hr> <h6>' + val['title'] + '</h6>');
            val['scores'].forEach(function(newval){
              $('#score').append('<li>'+newval['bowler']+' - '+'<b>Overs: </b>'+newval['O']+' , '+'<b>Runs: </b>'+newval['R'] + '  ');
              $('#score').append('<b>Maiden: </b>'+newval['M']+' ,<b>Wickets: </b>'+ newval['W']+' , <b>Economy: </b>'+newval['Econ']);
              $('#score').append('</li><br>');
            });
          });

      } ,
    });

    //getStats(squad1,squad2);
}
