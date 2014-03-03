angular.module('calendar.events.sources', ['calendar.events.localstoragex']);
angular.module('calendar.events.localstoragex', ['web.storage'])
    .factory('calendarEventReader', ['localStorage', CalendarEventReaderFactory])
    .factory('calendarEventIdGen', ['calendarEventReader', CalendarIdGeneratorFactory])
    .factory('calendarEventWriter', ['localStorage', 'calendarEventReader', 'calendarEventIdGen', CalendarEventWriterFactory])
    .factory('calendarEventDeleter', ['localStorage', 'calendarEventReader', CalendarEventDeleterFactory])
    .factory('calendarEventSourceFactory', ['calendarEventReader', CalendarEventSourceFactoryFactory]);

function CalendarEventReaderFactory(localStorage) {
    return function () {
        var raw = localStorage.binartaCalendarEvents;
        return  raw ? JSON.parse(raw).map(function(it) {
            if(it.start) it.start = moment(it.start);
            if(it.stop) it.stop = moment(it.stop);
            return it;
        }) : [];
    }
}

function CalendarIdGeneratorFactory(calendarEventReader) {
    return function() {
        return calendarEventReader().length + 1;
    }
}

function CalendarEventWriterFactory(localStorage, calendarEventReader, calendarEventIdGen) {
    return function (evt) {
        evt.id = calendarEventIdGen();
        evt.source = evt.type;
        var events = calendarEventReader();
        events.push(evt);
        localStorage.binartaCalendarEvents = JSON.stringify(events);
    }
}

function CalendarEventDeleterFactory(localStorage, calendarEventReader) {
    return function(args) {
        var events = calendarEventReader();
        var idx = events.reduce(function (p, c, i) {
            return c.id == args.id ? i : p;
        }, -1);
        if(idx > -1) events.splice(idx, 1);
        localStorage.binartaCalendarEvents = JSON.stringify(events);
    }
}

function CalendarEventSourceFactoryFactory(calendarEventReader) {
    return function (it) {
        return function (query) {
            console.log(JSON.stringify(it) + ':' + JSON.stringify(query));
            query.presenter(calendarEventReader().reduce(function(p, c) {
                if(c.source == it.id)
                    if(c.start.isSame(query.start) || c.start.isAfter(query.start))
                        if(c.stop.isSame(query.stop) || c.stop.isBefore(query.stop))
                            p.push(c);

                return p;
            }, []));
        };
    }
}
