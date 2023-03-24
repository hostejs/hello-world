// In network.js, export a function that fetches the SPY data from Yahoo Finance API
export async function getDataFromServer() {
  // Set the start and end dates
  let startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  let endDate = new Date();

  // Format the dates as YYYY-MM-DD
  startDate = startDate.toISOString().slice(0, 10);
  endDate = endDate.toISOString().slice(0, 10);

  // Make a GET request to the Yahoo Finance API with the dates and the symbol
  let response = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/download/SPY?period1=${startDate}&period2=${endDate}&interval=1d&events=history&includeAdjustedClose=true`
  );

  // Parse the response data as an array of objects
  let data = response.text().then((text) =>
    text.split("\n").slice(1).map((line) => {
      let [date, open, high, low, close, adjClose, volume] = line.split(",");
      return { date, open, high, low, close, adjClose, volume };
    })
  );

  // Return the data array
  return data;
}