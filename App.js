import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system"; // Import FileSystem

export default function App() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access audio is denied");
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
    } catch (error) {
      console.error("Error stopping recording:", error);
    } finally {
      setIsRecording(false);
    }
  };

  const saveRecording = async () => {
    if (!audioUri) return;

    // Generate a new filename (e.g., timestamp)
    const timestamp = new Date().getTime();
    const fileName = `audio_${timestamp}.wav`;

    // Define the directory where the audio file will be saved
    const directory = `${FileSystem.documentDirectory}audio/`;

    try {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      const newUri = `${directory}${fileName}`;

      // Move the recorded audio file to the new location
      await FileSystem.moveAsync({
        from: audioUri,
        to: newUri,
      });

      setAudioUri(newUri);
    } catch (error) {
      console.error("Error saving recording:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Recording App</Text>
      <Button
        title={isRecording ? "Stop Recording" : "Start Recording"}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {audioUri && (
        <View>
          <Text style={styles.audioUri}>Audio URI: {audioUri}</Text>
          <Button title="Save Recording" onPress={saveRecording} />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  audioUri: {
    marginTop: 20,
  },
});


