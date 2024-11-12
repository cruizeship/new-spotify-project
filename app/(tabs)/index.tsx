import { Image, StyleSheet, Platform,  View, Button, Alert, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import * as AuthSession from 'expo-auth-session';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function HomeScreen() {
  const redirectUri = 'exp://localhost:19002/--/spotify-auth-callback'
  console.log(redirectUri)

  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState('');


  const clientId = '32c467118f9c4fc38f72501738a50b70';
  const scopes = [
    'user-read-email',
    'user-library-read',
    'user-read-recently-played',
    'user-top-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
  ].join(' ');

  // Configure the authentication request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: [scopes],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    },
    discovery
  );

  // Handle the authentication response
  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      console.log('Access Token:', access_token);
      setToken(access_token)
    }
  }, [response]);

  useEffect(() => {
    if (token) {
      const fetchUserData = async () => {
        console.log('Fetching user data');
        try {
          const res = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, // Include the Bearer token in the request
            },
          });

          if (res.ok) {
            const data = await res.json();
            console.log('Got user data:', JSON.stringify(data));
            setUserData(data); // Set user data to state
          } else {
            console.error('Error fetching user data', res.status);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchUserData();
    }
  }, [token]);


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>

<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Authenticate with Spotify" onPress={() => {
          promptAsync();
        }} />
    </View>

    <View>
      {userData ? (
        <Text>Welcome {userData.display_name}! UserData: {JSON.stringify(userData)}</Text>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
