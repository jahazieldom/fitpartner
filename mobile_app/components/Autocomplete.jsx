import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function Autocomplete({
  data = [],
  labelKey = "name",
  placeholder = "Search...",
  onSelect,
  containerStyle,
  inputStyle,
  listStyle,
  itemStyle,
  initialValue = null, 
}) {
  const [query, setQuery] = useState(initialValue ? initialValue[labelKey] : "");
  const [showResults, setShowResults] = useState(false);

  const filtered = query.length
    ? data.filter((item) =>
        item[labelKey].toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (item) => {
    setQuery(item[labelKey]);
    setShowResults(false);
    onSelect?.(item);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        placeholder={placeholder}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setShowResults(true);
        }}
        style={[styles.input, inputStyle]}
      />
      {showResults && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => index.toString()}
          style={[styles.list, listStyle]}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={[styles.item, itemStyle]}
            >
              <Text>{item[labelKey]}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: "#fff",
  },
  list: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopWidth: 0,
    maxHeight: 150,
    backgroundColor: "#fff",
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
