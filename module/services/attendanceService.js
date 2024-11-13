const auth = require("../middleware/auth");
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
      latitude: 18.5824375,
      longitude: 73.7263487,
    };

    // Function to calculate distance between two latitude/longitude points
    const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // Radius of the Earth in meters
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        0.5 -
        Math.cos(dLat) / 2 +
        (Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          (1 - Math.cos(dLon))) /
          2;
      return (R * 2 * Math.asin(Math.sqrt(a))) / 1000; // Distance in meters
    };

    // Calculate distance between user and office
    const distance = getDistanceFromLatLonInMeters(
      userLatitude,
      userLongitude,
      officeCoordinates.latitude,
      officeCoordinates.longitude
    );

    // If the user is outside the 10-meter radius
    if (distance > 10) {
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
        office_location: {
          type: "Point",
          coordinates: [userLongitude, userLatitude], // Save coordinates in [longitude, latitude] format
        },
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
    // Logging the request data
    userLogger.info(
      __filename,
      "leave_create_list process request ---->  ," + JSON.stringify(data)
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

    // Setting up filters to retrieve data based on user ID and today's date
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

    // Setting up filters to retrieve data based on ID and today's date
    const filterData = {
      user_id: userId,
      createdAt: {
        $gte: startOfToday, // Start of today
        $lte: endOfToday, // End of today
      },
    };

    // Query to retrieve leave data based on filters
    const attendanceList = await Models.Attendance.find(filterData).exec();

    // If leave data is found, return it in the response
    if (attendanceList.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: attendanceList,
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
      "leave_create process response ---->  ," + JSON.stringify(data)
    );
    return data;
  } catch (error) {
    // Handle any errors
    userLogger.info(__filename, "leave_create catch block ---->  ," + error);
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
