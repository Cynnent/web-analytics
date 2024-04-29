const MostClickedActions = require("../models/wat_mostClickedActions");
const User = require("../models/wat_userModel");

const mostClickedActions = async (req, res) => {
  try {
    const client = req.params.clientName;
    const users = await User.find({ "userInfo.clientName": client });

    if (users.length === 0) {
      return res.json({
        message: `No data found for the client name: ${client}.`,
      });
    }

    const getMostClickedButtons = (data) => {
      const buttonCounts = {};
      data.forEach((item) => {
        if (item.userEvents) {
          item.userEvents.forEach((event) => {
            if (event.screens) {
              Object.values(event.screens).forEach((screen) => {
                Object.entries(screen).forEach(([button, count]) => {
                  if (!buttonCounts[button]) {
                    buttonCounts[button] = 0;
                  }
                  buttonCounts[button] += count;
                });
              });
            }
          });
        }
      });

      const sortedButtons = Object.keys(buttonCounts).sort(
        (a, b) => buttonCounts[b] - buttonCounts[a]
      );

      const mostClickedButtons = sortedButtons.map((button) => ({
        ButtonName: button,
        count: buttonCounts[button],
      }));

      return { mostClickedButtons };
    };

    const result = getMostClickedButtons(users);
    res.json(result.mostClickedButtons);
  } catch (error) {
    console.error("Error processing most viewed page data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { mostClickedActions };
