# DataVis
Final project for Data visualization
## Motivation
Pokémon is a globally renowned animated franchise, and trainers from around the world aspire to have a deeper understanding of these creatures. Therefore, our aim is to analyze the strengths and weaknesses of Pokémon by comparing various existing statistics. 
This analysis will assist novice players in comparing the values of Pokémon across different generations and attributes. Our visual charts will highlight the strengths and weaknesses of Pokémon from various generations and with different attributes, facilitating users in identifying and analyzing the Pokémon in which they are interested.
## Usage Scenario and Tasks
Wu is a passionate Pokémon player with a deep love for the Pokémon universe. One day, he discovered that his Dragonite couldn’t defeat a Mewtwo, prompting him to analyze how Pokémon stats influence the outcome of battles. 
Using our website, he can explore the relationships between  attributes, base stats, height, and weight for the 802 species across the seven Pokémon generations. Finally, he can select a Pokémon he wants to compare and contrast with his good friend Tsai’s favorite Pokémon from the generation and type that he selected.
## Dataset
- The Complete Pokemon Dataset
- The first dataset contains data on 802 Pokémon, including 44 features. We will utilize a part of these features to complete our data visualization.
Processing: When a Pokémon has two types, we choose the 'Type1' as the primary attribute.
- Pokemon Image Dataset
- The second dataset provides images of Pokémon, we place it in a radar chart to allow our users to more easily recognize the differences between Pokémon.
## Visualization Design
### First chart: Circular packing
- Bubble Size: 
The size of the bubble can indicate the number of Pokémon of that particular primary type within the generation.

- Bubble Image: 
The image of the bubble shows the type of the Pokémon.

- Interactions:
Hovering over a Bubble reveals the number of Pokémons in that bubble, type, and generation.
Clicking on the bubble will highlight the other bubbles with the same type.
Clicking the label above the chart will highlight the selected generation.
After selecting the generation, clicking the Next button on the top-left corner will lead to the second chart.

### Second chart: Scatter plot
X-axis: The values on the x-axis can show the weight(kg) of the pokemon.
Y-axis: The values on the y-axis can show the height(m) of the pokemon.
Color: The color of the point can show the type of the pokemon.

- Interactions:
Brushing the area of the plot can zoom in on the region that has been brushed.
Double-clicking on the area of the scatter plot can cancel the zoom-in.
Clicking on the label image on the right side will filter the data with that selected type
Hovering over a point can reveal the name, weight, height, and BMI of the Pokémon.
Clicking Next will lead to the third chart.

### Third chart: Stack bar chart
X-axis: The values on the x-axis can display all Pokémon from the specific generation and type selected by the user.
Y-axis: The values on the y-axis can display the values of the BST (Base Stat Total).

- Base Stat Total: 
The sum of the Pokémon's HP (Hit Points), Att (Attack), Def (Defense), Spa (Special Attack), Spd (Special Defense), and Spe (Speed) would give us the Base Stat Total (BST) for that Pokémon. 
The Base Stat Total is a measure commonly used by players to evaluate the overall strength and potential of a Pokémon in competitive play.

- Interactions:
Hovering over the stack bar can reveal the name and image of the Pokémon.
Clicking the label on the right side will display a bar chart for a specific attribute.
Clicking Next will lead to the fourth chart.

### Fourth chart: Radar chart
Displaying the image of the specific Pokémon selected via the dropdown, followed by a comparison of its stats with the Pokémon Tsai selected by using a radar chart.
The six features on the radar chart are the same as the previous stack bar chart (HP, Att, Def, Spa, Spd, and Spe)

- Interactions:
Clicking on the dropdown menu allows users to select the Pokémon they want to compare.
Clicking Evolution can display the evolutionary forms of the Pokémon selected by the user (if they exist).





