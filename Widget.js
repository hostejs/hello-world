// In widget.js, import the getDataFromServer function from network.js
import { getDataFromServer } from "./network.js";

// Define a class Widget that creates an element to display the SPY data
export class Widget {
  constructor() {
    // Create an element to hold the data
    this.element = document.createElement("div");
    this.element.id = "widget";

    // Get the SPY data from the server and render it
    getDataFromServer()
      .then((data) => this.render(data))
      .catch((error) => console.error(error));
  }

  // Define a method to render the SPY data
  render(data) {
    // Calculate the percentage change of the closing price
    for (let i = 1; i < data.length; i++) {
      let prevClose = Number(data[i - 1].close);
      let currClose = Number(data[i].close);
      let pctChange = ((currClose - prevClose) / prevClose) * 100;
      data[i].pctChange = pctChange.toFixed(2);
    }

    // Filter the days when the stock went up
    let spyUp = data.filter((obj) => obj.pctChange > 0);

    // Create a list element to display the dates and the percentage change
    let list = document.createElement("ul");
    for (let obj of spyUp) {
      let item = document.createElement("li");
      item.textContent = `${obj.date}: ${obj.pctChange}%`;
      list.appendChild(item);
    }

    // Append the list to the element
    this.element.appendChild(list);
  }
}