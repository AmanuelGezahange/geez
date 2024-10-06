import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Dimensions,
  PixelRatio,
} from "react-native";
import { Audio } from "expo-av";
import geezNumbers from "./helpers/geeznumbers";
import generateRandomNumber, {
  generateRandomGeezNumbers,
} from "./helpers/generateRandomNumbers";
import * as Animatable from "react-native-animatable";
import RNConfetti from "./Win";
import Stars from "./ScoringLogic";
import { FontAwesome } from "@expo/vector-icons";
import correctSound from "./assets/sound/correct.mp3"; // Replace with the correct path
import errorSound from "./assets/sound/wrong.mp3"; // Replace with the correct path
import sprinkleSound from "./assets/sound/sprinkle.mp3"; // Replace with the correct path

const { width } = Dimensions.get("window");
const scale = PixelRatio.get();

// Define ranges for screen sizes
const isSmallPhone = width < 360;
const isMediumPhone = width >= 360 && width < 414;
const isLargePhone = width >= 414;

export default function App() {
  const [text, setText] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [randomNumber, setRandomNumber] = useState(generateRandomNumber());
  const [myData, setMyData] = useState(
    generateRandomGeezNumbers(4, randomNumber)
  );
  const [score, setScore] = useState(0);
  const [sound, setSound] = useState();
  const [isSprinkling, setIsSprinkling] = useState(false);
  const [inputStyle, setInputStyle] = useState(styles.input);
  const [placeholderText, setPlaceholderText] = useState("");
  const [previousRandomNumber, setPreviousRandomNumber] = useState(null);
  const [isClearedOnce, setIsClearedOnce] = useState(false);
  const [hasPlayedErrorSound, setHasPlayedErrorSound] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false);
  const [placeholderTextColor, setPlaceholderTextColor] = useState("#888");

  const playSound = async (soundParams) => {
    const { sound } = await Audio.Sound.createAsync(soundParams);
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    return () => {
      sound && sound.unloadAsync();
    };
  }, [sound]);

  const handleClear = () => {
    if (!isClearedOnce) {
      // Proceed with clearing logic only if it hasn't been cleared yet
      const newRandomNumber = Math.floor(Math.random() * 100) + 1;
      const correctAnswer = geezNumbers[newRandomNumber]; // Get the correct answer

      // Generate three random numbers, ensuring none of them are the correct answer
      let newOptions = generateRandomGeezNumbers(3, newRandomNumber);

      // Add the correct answer to the options
      newOptions.push(correctAnswer);

      // Shuffle the options
      newOptions = newOptions.sort(() => Math.random() - 0.5);

      // Reset the game state
      setText("");
      setSelectedText("");
      setScore(0); // Reset the score
      setRandomNumber(newRandomNumber);
      setMyData(newOptions); // Set new options with the correct answer
      resetInputStyle("white");
      setPlaceholderText("");
      setIsSprinkling(false);
      setPreviousRandomNumber(null); // Reset the previous random number

      // Mark that the game has been cleared once
      setIsClearedOnce(true);
      setHasPlayedErrorSound(false);
    }
  };

  const selectAnswer = (num) => {
    if (placeholderText.length < 1) {
      setSelectedText(num);
      setText(num);
    }
  };

  const handleSubmit = () => {
    const correctAnswer = geezNumbers[randomNumber];

    if (selectedText === correctAnswer) {
      if (randomNumber !== previousRandomNumber) {
        setScore((prevScore) => {
          const newScore = prevScore + 1;
          if (newScore === 100) {
            setIsSprinkling(true);
            playSound(sprinkleSound);
          } else {
            resetInputStyle("#28a745","#FFFFFF");
            setPlaceholderText("ጎበዝ ✅");
            playSound(correctSound);
          }
          return newScore;
        });
        setPreviousRandomNumber(randomNumber);
      }

      setText("");
      setHasPlayedErrorSound(false); // Reset error sound flag
      setIsLastAnswerCorrect(true);
    } else {
      resetInputStyle("#dc3545","#e0e0e0");
      setPlaceholderText("ሰህተት ✖️");
      setScore((prevScore) => Math.max(prevScore - 1, 0));
      setIsSprinkling(false);
      setIsLastAnswerCorrect(false);

      // Only play the error sound if it hasn't been played for this wrong attempt
      if (!hasPlayedErrorSound) {
        playSound(errorSound);
        setHasPlayedErrorSound(true); // Mark the error sound as played
      }
      setText("");
    }
    setIsClearedOnce(false);
  };

  const resetInputStyle = (color,placeholderColor) => {
    setInputStyle({
      ...styles.input,
      backgroundColor: color,
    });
    setPlaceholderTextColor(placeholderColor);
  };

  const handleNextQuestion = () => {
    if (isLastAnswerCorrect) {
      // Only allow proceeding if the last answer was correct
      const newRandomNumber = Math.floor(Math.random() * 100) + 1;
      setRandomNumber(newRandomNumber);
      setMyData(generateRandomGeezNumbers(4, newRandomNumber));
      resetInputStyle("white", "black");
      setPlaceholderText("");
    } else {
      // Optionally, provide feedback that they need to answer correctly first
      // resetInputStyle("yellow", "");
      // setPlaceholderText("እንደገና ይሞክሩ!"); // Example placeholder message
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.scoreIndicator}>
        <Text style={styles.scoreLabel}>10 ነጥብ =</Text>
        <FontAwesome name="star" size={15} color="orange" />
      </View>
      {isSprinkling && (
        <RNConfetti
          confettiCount={100}
          timeout={40} // Set timeout to match sprinkle audio length
          duration={40} // Set duration to match audio length
          colors={[
            "rgb(242.2, 102, 68.8)",
            "rgb(255, 198.9, 91.8)",
            "rgb(122.4, 198.9, 163.2)",
            "rgb(76.5, 193.8, 216.7)",
            "rgb(147.9, 99.4, 140.2)",
          ]}
          size={10}
          bsize={10}
        />
      )}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>ነጥብ: {score}</Text>
        <Stars score={score} />
      </View>
      <View style={styles.randomNumberContainer}>
        <Text style={styles.randomNumber}>{randomNumber}</Text>
      </View>
      <Text style={styles.label}>ትክክለኛዉን መልስ ምረጡ</Text>
      <TextInput
        style={inputStyle}
        value={text}
        onChangeText={setText}
        placeholder={placeholderText}
        placeholderTextColor={placeholderTextColor}
      />
      <View style={styles.optionsContainer}>
        {myData.map((number, index) => (
          <Pressable
            key={index}
            style={styles.optionButton}
            onPress={() => selectAnswer(number)}
          >
            <Text style={styles.output}>{number}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.buttonText}>አጥፋ</Text>
        </Pressable>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>መልስ</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={handleNextQuestion}>
          <Text style={styles.buttonText}>ቀጣይ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "yellow",
    alignItems: "center",
  },
  scoreIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 15,
    marginRight: 3,
  },
  output: {
    color: "#FFF", // White text for contrast
    fontSize: 20, // Larger font size for better readability
    fontWeight: "bold", // Bold text for emphasis
    textAlign: "center", // Center the text
    paddingVertical: 10, // Add vertical padding for better spacing
  },
  scoreContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  randomNumberContainer: {
    backgroundColor: '#f39c12', // A deep orange to contrast with yellow
    borderRadius: 15,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    alignItems: 'center',
  },
  randomNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff', // White text for contrast
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "black",
  },
  label: {
    fontSize: 22,
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    height: 50,
    backgroundColor: "white",
    borderColor: "#00796b",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
    width: "75%",
    textAlign: "center"
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 25,
    width: "100%",
    paddingHorizontal: 10,
  },
  optionButton: {
    backgroundColor: "#8B4513", // Dark brown for a richer look
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 120,
    shadowColor: "#000", // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Elevation for Android
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%", // Ensure buttons stretch across the available width
  },
  output: {
    color: "#FFF", // White text for contrast against dark background
    fontSize: 18, // Increased font size for readability
    fontWeight: "bold", // Bold text for emphasis
    textAlign: "center", // Center the text
  },
  clearButton: {
    backgroundColor: "#FF4D4D", // Bright red
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    elevation: 5, // Adds shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButton: {
    backgroundColor: "#4CAF50", // Green
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButton: {
    backgroundColor: "#2196F3", // Blue
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold", // Make text bold for better visibility
  },
});
