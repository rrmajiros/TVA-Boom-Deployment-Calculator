### TVA Boom Deployment Calculator

### Project Overview

The **TVA Boom Deployment Calculator** is a web-based planning tool for the TVA Environmental Response Team. It's designed to simplify the process of calculating boom deployment parameters for containing **No. 2 fuel oil spills** on inland rivers and lakes. The tool provides immediate, data-driven recommendations, adapting the 2013 EPA Inland Response Tactics Manual for the specific anchor systems used by the TVA.

---

### ✨ Key Features

* **Flexible Inputs**: The tool offers three primary methods for calculation:
    * **Manual Input**: Enter a known **current** or a specific **max boom angle**.
    * **Drift Time**: Measure the time it takes for a float to drift 100 feet. The calculator then uses this data to determine the river's current.
* **Integrated Stopwatch**: A built-in timer allows for accurate on-site measurement of drift time.
* **Real-time Calculations**: As you input data, the tool instantly calculates the required **boom length**, estimated **tension**, and recommended **anchor interval**.
* **Dynamic Recommendations**: For high-current situations, the calculator provides a recommendation for a **Cascade Booming System**, including details on the number of segments, segment length, and total anchors needed.
* **Data Persistence & Export**: Measurement data is temporarily saved to an Airtable database for **24 hours**, allowing for analysis and the option to export the data to a CSV file within that period.
* **Google AI Integration**: The tool uses Google's Generative Language API to create a professional operational report that summarizes the strategy and outlines operating conditions and logistics.
* **Airtable Integration**: All deployment data is automatically saved to an Airtable database, enabling advanced strategy development, record-keeping, and analysis.
* **Reference Data**: All calculations are based on the **2013 EPA Inland Response Tactics Manual**, adapted for 8x12 river boom and 22 lb Danforth anchors.

---

### ⚙️ How to Use

1.  Open the `index.html` file in any modern web browser.
2.  Input the **River Width** in feet.
3.  Choose your preferred calculation method:
    * **Option 1**: Enter a known Current or Max Boom Angle directly.
    * **Option 2**: Use the built-in stopwatch to measure the drift time over a 100-foot distance.
4.  The results will automatically display in the **"Calculated Results"** table.
5.  To save the data, enter the **River Mile** and click the **"Generate & Save Report"** button. The report will appear on the screen and be saved to the connected Airtable base. **The saved data is available for 24 hours and can be exported to a CSV file from the Airtable base during this time.**

---

### 🛠️ Technology Stack

* **Frontend**: HTML, JavaScript, and Tailwind CSS.
* **API Integration**:
    * **Airtable API**: For persistent data storage and reporting.
    * **Google's Generative Language API**: For generating detailed operational reports.
