const icsUrl = 'https://calendar.google.com/calendar/ical/43ce8efa33c91afebac73e98451c8f2652ad3539f774f2554b4573cdd01e90a4%40group.calendar.google.com/public/basic.ics';

fetch(icsUrl)
  .then(response => response.text())
  .then(data => {
    const events = parseICS(data);
    displayEvents(events);
  })
  .catch(error => console.error('Error al cargar el calendario:', error));

function parseICS(data) {
  const events = [];
  const regex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;
  while ((match = regex.exec(data)) !== null) {
    const eventData = match[1];
    const event = {};
    eventData.split('\n').forEach(line => {
      if (line.startsWith('SUMMARY:')) {
        event.title = line.replace('SUMMARY:', '').trim();
      } else if (line.startsWith('DTSTART')) {
        event.start = line.split(':')[1].trim();
      } else if (line.startsWith('LOCATION:')) {
        event.location = line.replace('LOCATION:', '').trim();
      }
    });
    events.push(event);
  }
  return events;
}

function displayEvents(events) {
  const container = document.getElementById('eventsContainer');
  const now = new Date();

  events
    .map(event => {
      event.startDate = new Date(event.start);
      return event;
    })
    .filter(event => event.startDate >= now)
    .sort((a, b) => a.startDate - b.startDate)
    .forEach(event => {
      const dateStr = `${formatDate(event.start)} ${formatTime(event.start)}`;
      const title = event.title || 'Evento';
      const [url, locationName] = event.location?.includes('|')
        ? event.location.split('|')
        : [null, event.location];

      const eventItem = document.createElement('div');
      eventItem.className = 'event-item';

      eventItem.innerHTML = `
        <p class="event-details">
          <span class="event-date"><i class="fa fa-calendar w3-text-red"></i> ${dateStr}</span>
          <span class="event-location"><i class="fa fa-map-marker w3-text-white"></i> 
            <a href="${url || '#'}" target="_blank">${locationName}</a>
          </span>
        </p>
      `;

      container.appendChild(eventItem);
    });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
