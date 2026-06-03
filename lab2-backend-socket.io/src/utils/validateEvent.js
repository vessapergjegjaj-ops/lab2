const validateEvent = (event) => {
  if (!event.name || !event.eventDate) {
    throw new Error('Name and event date are required');
  }

  if (event.home_team_id === event.away_team_id) {
    throw new Error('Teams cannot be the same');
  }
};

module.exports = validateEvent;