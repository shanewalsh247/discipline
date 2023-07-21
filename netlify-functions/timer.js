// timer.js

const faunadb = require('faunadb');

// Configure FaunaDB client with your secret key
const secret = 'fnAFJX8bt7AAUEle-qxXg08oTQ4RQkZlx4umrMz3'; // Replace with your actual FaunaDB secret key
const q = faunadb.query;
const client = new faunadb.Client({ secret });

exports.handler = async (event, context) => {
  try {
    // Parse the incoming request body
    const data = JSON.parse(event.body);

    // Check the request type (start or reset)
    if (data.action === 'start') {
      // Store the timer state in FaunaDB
      const timerState = {
        days: data.days,
        hours: data.hours,
        minutes: data.minutes,
        seconds: data.seconds
      };

      const result = await client.query(
        q.Create(q.Collection('timers'), { data: timerState })
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Timer started successfully.' })
      };
    } else if (data.action === 'stop') {
      // Remove the timer state from FaunaDB
      const timerRef = await client.query(
        q.Paginate(q.Match(q.Index('timer_by_action'), 'start'))
      );
      
      if (timerRef.data.length > 0) {
        const ref = timerRef.data[0];
        await client.query(q.Delete(ref));

        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Timer stopped successfully.' })
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'No timer found to stop.' })
        };
      }
    } else if (data.action === 'reset') {
      // Remove the timer state from FaunaDB
      const timerRef = await client.query(
        q.Paginate(q.Match(q.Index('timer_by_action'), 'start'))
      );
      
      if (timerRef.data.length > 0) {
        const ref = timerRef.data[0];
        await client.query(q.Delete(ref));

        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Timer reset successfully.' })
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'No timer found to reset.' })
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid action.' })
      };
    }
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred.' })
    };
  }
};

