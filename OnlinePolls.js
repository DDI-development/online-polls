Polls = new Meteor.Collection('polls');
Results = new Meteor.Collection('results');

if (Meteor.isClient) {

    Template.poll.helpers({
        poll: function () {
            return Polls.findOne();
        },
        count: function () {
            return Polls.find().count();
        }
    });

    Template.results.helpers({
        result: function () {
            return Results.find({}, {sort: {date: -1 }, limit: 10});
        },
        count: function () {
            return Results.find().count();
        }
    });

    Template.results.events({
        'click a': function (e) {
            e.preventDefault();
            Results.remove({_id: this._id});
        }
    });
    
    Template.poll.events({
        'click input[type="submit"]': function (e) {
            e.preventDefault();

            var form = {};
            var frm = $('.poll_form');
            $.each(frm.serializeArray(), function () {
                form[this.name] = this.value;
            });
            
            form['date'] = new Date().toTimeString();
            form['userId'] = Meteor.userId();

            var poll = Polls.findOne();
            var index = null;
            for (var i = 0; i < poll.options.length; i++) {
                if (poll.options[i].name === form[this.name]) {
                    index = i;
                    break;
                }
            }
            if (index !== null) {
                Results.insert(form, function (err) {
                    if (!err) {
                        frm[0].reset();
                    } else {
                        alert("Something is wrong");
                        console.log(err);
                    }
                });

                var incModifier = { $inc: {} };
                incModifier.$inc['options.' + index + '.value'] = 1;
                Polls.update({_id: this._id}, incModifier);
            }
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup

        if (Polls.find().count() === 0) {
            Polls.insert({
                title: 'What is your gender',
                title_ru: 'Выберите ваш пол',
                name: 'gender',
                options: [
                    {name: 'male', text: "I'm Male", value: 0},
                    {name: 'female', text: "I'm Female", value: 0 },
                    {name: 'idunno', text: "I don't know who am I", value: 0 }
                ]
            });
        }
    });
}
