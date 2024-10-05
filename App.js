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
      setHasPlayedErrorSound(false)
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
            resetInputStyle("orange");
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
      resetInputStyle("pink");
      setPlaceholderText("ሰህተት ❌");
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

  const resetInputStyle = (color) => {
    setInputStyle({
      ...styles.input,
      backgroundColor: color,
    });
    // setPlaceholderText(plcholder);
  };

  const handleNextQuestion = () => {
    if (isLastAnswerCorrect) { // Only allow proceeding if the last answer was correct
      const newRandomNumber = Math.floor(Math.random() * 100) + 1;
      setRandomNumber(newRandomNumber);
      setMyData(generateRandomGeezNumbers(4, newRandomNumber));
      resetInputStyle("white", "");
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
        placeholderTextColor="#888"
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
    color: "white",
    fontSize: "20px",
  },
  scoreContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  randomNumberContainer: {
    alignItems: "center",
    justifyContent: "center", // Center content vertically
    marginBottom: isSmallPhone ? 15 : isMediumPhone ? 20 : 25,
  },
  randomNumber: {
    fontSize: isSmallPhone ? 24 : isMediumPhone ? 28 : 32, // Adjust font size
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#d69a6a",
    width: isSmallPhone ? 60 : isMediumPhone ? 80 : 100, // Adjust size of circle
    height: isSmallPhone ? 60 : isMediumPhone ? 80 : 100,
    borderRadius: isSmallPhone ? 30 : isMediumPhone ? 40 : 50, // Adjust circle radius
    alignItems: "center", // Center text horizontally
    justifyContent: "center", // Center text vertically
    textAlign: "center", // Ensure text is centered
    display: "flex", // Make it a flex container
    elevation: 3,
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
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 25,
    width: "100%",
    paddingHorizontal: 10,
  },
  optionButton: {
    backgroundColor: "brown",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 120,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
  },
});
