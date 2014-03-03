describe('calendar.events.localstoragex', function () {
    var local, writer, deleter;
    var sourceName = 'source-name';

    beforeEach(module('calendar.events.sources'));
    beforeEach(inject(function(localStorage) {
        local = localStorage
        localStorage.removeItem('binartaCalendarEvents');
    }));

    describe('given an event writer', function() {
        beforeEach(inject(function(calendarEventWriter) {
            writer = calendarEventWriter;
        }));

        function storeEvents(events) {
            localStorage.removeItem('binartaCalendarEvents');
            events.forEach(function(it) {
                writer(it);
            });
            expect(localStorage.binartaCalendarEvents).toEqual(JSON.stringify(events));
        }

        it('which stores events in locale storage', function() {
            storeEvents([{type: sourceName}]);
            storeEvents([{type: sourceName}, {type: sourceName}]);
        });

        it('which should generate an event id', function() {
            storeEvents([{type: sourceName}, {type: sourceName}]);
            var events = JSON.parse(localStorage.binartaCalendarEvents);
            expect(events[0].id).toBeTruthy();
            expect(events[0].id).toNotEqual(events[1].id);
        });
    });

    describe('given an event source', function() {
        var source;

        beforeEach(inject(function(calendarEventSourceFactory) {
            source = calendarEventSourceFactory({id:sourceName});
        }));

        it('should load an empty set of events', function() {
            expect(source({presenter:function(events) {
                expect(events).toEqual([]);
            }}));
        });

        describe('when adding an event to the source', function() {
            var start, stop, evt;

            beforeEach(inject(function(calendarEventWriter, calendarEventDeleter) {
                start = moment();
                stop = start.add('days', 1);
                evt = {
                    type: sourceName,
                    start: start,
                    stop: stop
                };
                writer = calendarEventWriter;
                deleter = calendarEventDeleter;
                writer(evt);
            }));

            it('loading before the window should return empty', function() {
                expect(source({start:start.subtract('days', 1), stop:start, presenter:function(events) {
                    expect(events).toEqual([]);
                }}));
            });

            it('loading after the window should return empty', function() {
                expect(source({start:stop, stop:stop.add('days', 1), presenter:function(events) {
                    expect(events).toEqual([]);
                }}));
            });

            it('loading wider than the window should return the event', function() {
                var formatter = function(it) {
                    it.start = it.start.toJSON();
                    it.stop = it.stop.toJSON();
                    return it;
                };

                source({start: stop, stop: stop, presenter:function(events) {
                    expect(events.map(formatter)).toEqual([evt].map(formatter));
                }});
            });

            describe('and a second event', function() {
                var events;

                beforeEach(function() {
                    evt = {
                        type: sourceName,
                        start: start,
                        stop: stop
                    };
                    writer(evt);
                    events = JSON.parse(localStorage.binartaCalendarEvents);
                });

                it('delete the first event', function() {
                    deleter(events[0]);
                    expect(JSON.parse(localStorage.binartaCalendarEvents).length).toEqual(1);
                    expect(JSON.parse(localStorage.binartaCalendarEvents)).toEqual([events[1]]);
                });

                it('deleting an unknown event has no effect', function() {
                    deleter({id:'unknown'});
                    expect(JSON.parse(localStorage.binartaCalendarEvents).length).toEqual(2);
                });
            });
        });
    });
});