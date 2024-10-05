// Stars.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Ensure you have this library installed

const Stars = ({ score }) => {
  const stars = [];
  const totalStars = 10; // Fixed number of stars

  for (let i = 0; i < totalStars; i++) {
    // Fill stars only if score is greater than or equal to (i + 1) * 10
    stars.push(
      <FontAwesome
        key={i}
        name="star"
        size={24}
        color={score >= (i + 1) * 10 ? "gold" : "gray"} // Light up stars based on score
      />
    );
  }

  return (
    <View style={styles.container}>
      {stars}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default Stars;
