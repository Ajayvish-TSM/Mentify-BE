const Auth = require("../middleware/auth");
const Mongoose = require("mongoose");
const create = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);
    console.log("Received data:", decoded);

    // Validate user conditions
    if (
      decoded?.usertype_in === false ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not a valid user!!",
      };
      return data;
    }

    const userLatitude = data.latitude; // User's latitude from the frontend request
    const userLongitude = data.longitude; // User's longitude from the frontend request

    // Office coordinates
    const officeCoordinates = {
      latitude: 18.582499725047473,
      longitude: 73.72627792404252,
    };

    // Function to calculate distance between two latitude/longitude points
    const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // Earth's radius in meters
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in meters
    };
    // Calculate distance between user and office
    const distance = getDistanceFromLatLonInMeters(
      18.582499725047473,
      73.72627792404252,
      officeCoordinates.latitude,
      officeCoordinates.longitude
    );

    // If the user is outside the 10-meter radius
    if (distance > 100) {
      data.response = {
        status: 0,
        message: "You are not within the office radius.",
      };
      return data;
    }

    // If within the office radius, continue with the attendance logic
    let attendanceRecord = await Models.Attendance.findOne({
      user_id: decoded._id,
      status: "logged_in",
    }).exec();

    if (attendanceRecord) {
      // Log out the user
      attendanceRecord.logout_time = new Date();
      attendanceRecord.status = "logged_out";
      await attendanceRecord.save(); // Save the updated record
      data.response = {
        status: 200,
        message: "Successfully logged out.",
      };
    } else {
      // Log in the user (create a new attendance record)
      attendanceRecord = new Models.Attendance({
        user_id: decoded._id,
        login_time: new Date(),
        status: "logged_in",
      });
      await attendanceRecord.save(); // Save the new record
      data.response = {
        status: 200,
        message: "Successfully logged in.",
      };
    }

    return data;
  } catch (error) {
    console.error("Error while handling attendance:", error);
    data.response = {
      status: 0,
      message: "Something went wrong",
      error: error.message,
    };
    return data;
  }
};
const get_attendance_list_id = async (data, authData) => {
  try {
    userLogger.info(
      __filename,
      "attendance_list process request ---->  ," + JSON.stringify(data)
    );

    // Decoding the authentication token
    const decoded = Auth.decodeToken(authData);
    if (
      decoded.usertype_in == false ||
      decoded.is_active == false ||
      decoded.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    const userId = new Mongoose.Types.ObjectId(decoded._id);

    // Set today's date range
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

    // Filters to retrieve attendance data for today
    const filterData = {
      user_id: userId,
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    };

    // Retrieve attendance data
    const attendanceList = await Models.Attendance.find(filterData)
      .sort({ createdAt: 1 })
      .exec();

    if (attendanceList.length > 0) {
      const firstLogin = attendanceList.find(
        (att) => att.status === "logged_in"
      );
      const lastLogout = attendanceList
        .filter((att) => att.status === "logged_out")
        .pop();

      // Automatically log out at midnight if user hasn't logged out
      if (firstLogin && !lastLogout) {
        const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

        // Insert an automatic logout entry
        await Models.Attendance.create({
          user_id: userId,
          status: "logged_out",
          createdAt: endOfDay,
        });

        // Re-fetch the updated data
        attendanceList.push({
          user_id: userId,
          status: "logged_out",
          createdAt: endOfDay,
        });
      }

      // Recalculate total hours
      const updatedFirstLogin = attendanceList.find(
        (att) => att.status === "logged_in"
      );
      const updatedLastLogout = attendanceList
        .filter((att) => att.status === "logged_out")
        .pop();

      let totalHours = 0;
      if (updatedFirstLogin && updatedLastLogout) {
        const firstLoginTime = new Date(updatedFirstLogin.createdAt);
        const lastLogoutTime = new Date(updatedLastLogout.createdAt);
        if (firstLoginTime < lastLogoutTime) {
          totalHours = (
            (lastLogoutTime - firstLoginTime) /
            1000 /
            3600
          ).toFixed(2);
        }
      }

      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: {
          firstLogin: updatedFirstLogin || null,
          lastLogout: updatedLastLogout || null,
          totalHours: totalHours || 0,
        },
        message: "Data found.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "No attendance data found.",
      };
    }

    userLogger.info(
      __filename,
      "attendance_list process response ---->  ," + JSON.stringify(data)
    );
    return data;
  } catch (error) {
    userLogger.info(__filename, "attendance_list catch block ---->  ," + error);
    console.log("error      ---------->  ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

module.exports = {
  create,
  get_attendance_list_id,
};
