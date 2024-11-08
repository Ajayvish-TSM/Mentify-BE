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
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of the Earth in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        0.5 -
        Math.cos(dLat) / 2 +
        (Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          (1 - Math.cos(dLon))) /
          2;
      const distance = R * 2 * Math.asin(Math.sqrt(a)); // Distance in km
      return distance; // Convert to meters
    }

    // Calculate distance between user and office
    const distance = getDistanceFromLatLonInKm(
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

module.exports = {
  create,
};
