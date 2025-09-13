TVA Boom Deployment Calculator
This is a web-based planning tool developed by TVA consultants to assist in calculating boom deployment parameters for containing No. 2 fuel oil spills on on inland rivers/lakes and is adapted for the anchor systems in use by the TVA Environmental Response Team, which differ from those described in the 2013 EPA Inland Response Tactics Manual. The calculator simplifies on-site assessments by providing immediate, data-driven recommendations.

Key Features
Flexible Inputs: Calculate deployment based on a measured Current, a specific Max Boom Angle, or a measured Time to Drift over a 100-foot distance.

Integrated Stopwatch: Use the built-in timer to accurately measure drift time, which is then used to calculate the river's current.

Real-time Calculations: The tool instantly calculates the required boom length, estimated tension, and recommended anchor interval.

Dynamic Recommendations: Provides a recommendation for a Cascade Booming System when river currents are high, including details on the number of segments, segment length, and total anchors needed.

Google AI Integration: Generates a professional operational report that summarizes the stratey and outlines the operating conditions a logistics.

Airtable Integration: Automatically saves all deployment data to an Airtable database for advanced strategy development, record-keeping and analysis.

Reference Data: All calculations are based on the 2013 EPA Inland Response Tactics Manual and are adapted for 8x12 river boom and 22 lb Danforth anchors.

How to Use
Open the index.html file in any modern web browser.

Input the River Width (in feet).

Choose one of the following methods for the calculation:

Option 1: Manual Input: Enter a known Current or Max Boom Angle.

Option 2: Use the Timer: Use the stopwatch to measure the time it takes for a float to drift 100 feet downstream. The calculated time will automatically populate the "Time to Drift" field.

The results will be displayed automatically in the "Calculated Results" table.

If you want to save the report, enter the River Mile and click the "Generate & Save Report" button. The report will appear on the screen and be saved to the connected Airtable base.

Technology Stack
Frontend: HTML, JavaScript, and Tailwind CSS.

API Integration:

Airtable API: For persistent data storage and reporting.

Google's Generative Language API: For generating detailed operational report text.
