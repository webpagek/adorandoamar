// URL del calendario público en formato ICS
const icsUrl = 'https://calendar.google.com/calendar/ical/43ce8efa33c91afebac73e98451c8f2652ad3539f774f2554b4573cdd01e90a4%40group.calendar.google.com/public/basic.ics';

// Utilizar un proxy CORS para evitar el error
const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';

// Realiza la solicitud GET utilizando el proxy
fetch(corsProxyUrl + icsUrl)
  .then(response => response.text())
  .then(data => {
    const events = parseICS(data); // Procesar los datos ICS
    displayEvents(events); // Mostrar los eventos en el HTML
  })
  .catch(error => {
    console.error('Error al cargar el calendario:', error);
  });

// Función para analizar el archivo ICS y extraer los eventos
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

// Función para mostrar los eventos en el HTML
function displayEvents(events) {
  const container = document.getElementById('eventsContainer');
  const now = new Date();

  events
    .map(event => {
      event.startDate = new Date(event.start);
      return event;
    })
    .filter(event => event.startDate >= now) // Filtrar eventos futuros
    .sort((a, b) => a.startDate - b.startDate) // Ordenar por fecha
    .forEach(event => {
      const dateStr = `${formatDate(event.start)} ${formatTime(event.start)}`;
      const title = event.title || 'Evento';
      const [url, locationName] = event.location?.includes('|')
        ? event.location.split('|') // Si hay una URL en la ubicación
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

// Función para formatear la fecha en formato largo
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

// Función para formatear la hora
function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
