const User = require("../models/wat_userModel");

const dateFilter = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = await User.findOne({ _id: userId });

    if (!userData) {
      return res
        .status(404)
        .json({ error: "No data found for the specified _id." });
    }
    const userEvents = userData.userEvents;

    if (userEvents.length === 0) {
      return res
        .status(404)
        .json({ error: "No user events found for the specified _id." });
    }
    const allDates = userData.userEvents.map((event) => ({ date: event.date }));
    return res.json(allDates);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserEvents = async (req, res) => {
  try {
    const userId = req.params.userId;
    const date = req.params.date;
    const userData = await User.findOne({ _id: userId });
    if (!userData) {
      return res
        .status(404)
        .json({ error: "No data found for the specified _id." });
    }
    const userEvents = userData.userEvents.filter(
      (event) => event.date === date
    );

    if (userEvents.length > 0) {
      return res.json(userEvents[0]);
    }
    return res
      .status(404)
      .json({ error: "No data found for the specified date." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getweeklyData = async (req, res) => {
  try {
    const userId = req.params.userId;
    function getCurrentFormattedDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const date = getCurrentFormattedDate();

    const userData = await User.findOne({ _id: userId });

    if (userData && userData.userEvents.length > 0) {
      const getWeekDates = (dateStr) => {
        const date = new Date(dateStr);
        const startOfWeek = new Date(date);
        const endOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
        return { startOfWeek, endOfWeek };
      };

      const { startOfWeek, endOfWeek } = getWeekDates(date);

      const filteredData = userData.userEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
      if (filteredData.length) {
        return res.json(filteredData);
      } else {
        res.status(404).json({ error: "No user data found for current week" });
      }
    } else {
      return res
        .status(404)
        .json({ error: "User data or user events not found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getmonthlyData = async (req, res) => {
  try {
    const userId = req.params.userId; 
    function getCurrentFormattedDate() {
      const today = new Date();
      const year = today.getFullYear();
      // getMonth() returns month from 0 to 11, so add 1 to get the correct month
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const date = getCurrentFormattedDate(); //"2024-03-11";


    const userData = await User.findOne({ _id: userId });

    if (userData && userData.userEvents.length > 0) {
      const getMonthDates = (dateStr) => {
        const date = new Date(dateStr);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return { startOfMonth, endOfMonth };
      };

      const { startOfMonth, endOfMonth } = getMonthDates(date);

      const filteredData = userData.userEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });
      if (filteredData.length) {
        return res.json(filteredData);
      } else {
        res.status(404).json({ error: "No user data found for current month" });
      }
    } else {
      return res
        .status(404)
        .json({ error: "User data or user events not found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { dateFilter, getUserEvents, getweeklyData, getmonthlyData };
