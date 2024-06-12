import React, { useState, useEffect } from 'react';
import { Button, View } from 'react-native';
import { useAuthRequest, ResponseType } from 'expo-auth-session';
import base64 from "react-native-base64";

const clientId = '23PHWD';
const clientSecret = 'dcb7bc8287aeb1abf247f125fcc7ce86';
const redirectUri = 'myapp://redirect';
const scopes: string[] = ['activity', 'cardio_fitness', 'heartrate', 'location', 'nutrition', 'oxygen_saturation', 'profile', 'respiratory_rate', 'settings', 'sleep', 'social', 'temperature', 'weight'];

const discovery = {
  authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
  tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
};

function FitbitOverview() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      scopes,
      usePKCE: false,
      redirectUri,
      responseType: ResponseType.Code
    },
    discovery
  );

  // const [heartRate, setHeartRate] = useState<number | null>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      if (typeof code === 'string') {
        exchangeCodeForToken(code);
      }
      // console.log(response);
    }
  }, [response]);

  async function exchangeCodeForToken(code: string): Promise<void> {

    try {
      const credentials = `${clientId}:${clientSecret}`;
      const base64Credentials = base64.encode(credentials);

      const response = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${base64Credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `client_id=${clientId}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}&expires_in=1`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const access_token = data.access_token;
      console.log('Data:', data)
      console.log('Access token:', access_token);

      // if (typeof access_token === 'string') { 
      //   fetchHeartRate(access_token);
      // } else {
      //   console.error("Failed to obtain access token", data);
      // }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    }
  }
  

  // async function fetchHeartRate(accessToken: string): Promise<void> {
  //   try {
  //     const response = await fetch('https://api.fitbit.com/1/user/-/activities/heart/date/2024-01-29/1d.json', {
  //       headers: {
  //         'Authorization': `Bearer ${accessToken}`,
  //       },
  //     });
      
  //     const data = await response.json();
      
  //     if (response.ok && data['activities-heart'] && data['activities-heart'][0]) {
  //       const restingHeartRate: number = data['activities-heart'][0]['value']['restingHeartRate'];
  //       setHeartRate(restingHeartRate);
  //     } else {
  //       // Handle the case where there is no heart rate data
  //       console.error("Heart rate data is not available.");
  //     }
  //   } catch (error) {
  //     // Handle any fetch errors
  //     console.error("Failed to fetch heart rate data", error);
  //   }
  // }


  return (
    // <View style={styles.container}>
    <View>
      <Button
        disabled={!request}
        title="Sign in to Fitbit"
        onPress={() => {
          promptAsync();
        }}
      />
       {/* {heartRate !== null && (
        <Text>Resting Heart Rate: {heartRate} bpm</Text>
      )} */}
    </View>
  );
}

export default FitbitOverview;