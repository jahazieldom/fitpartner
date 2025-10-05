import React, { useState } from "react";
import { View, TouchableOpacity, Modal, FlatList } from "react-native";
import { colors, spacing, layout } from "@/styles";
import CustomText from "@/components/CustomText";
import Octicons from "@expo/vector-icons/Octicons";
import { useAuth } from "@/context/AuthContext";

export default function TitleCompanyName() {
  const { company, user, setCompany } = useAuth(); // Necesitamos setCompany en el contexto
  const [modalVisible, setModalVisible] = useState(false);

  const companyName = company?.company_name || "Selecciona una empresa";
  const location = company?.location;
  const items = []

  const handleSwitchCompany = (newCompany) => {
    setCompany(newCompany); // Actualiza la empresa en el contexto
    setModalVisible(false);
  };

  user?.companies.forEach((company) => {
    if(company.locations.length > 1) {
      company.locations.forEach(loc => {
        items.push({
          "key": `${company.id}-${loc.id}`,
          "label": `${company.company_name} - ${loc.name}`,
          ...company,
          "location": loc,
        })
      })
    } else {
      items.push({
        "key": `${company.id}-`,
        "label": company.company_name,
        ...company,
        "location": null,
      })
    }
  })

  return (
    <View
      style={{
        padding: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: "white",
      }}
    >
      <View style={[layout.row, { justifyContent: "space-between" }]}>
        <View>
          <CustomText style={{ fontSize: 17 }}>
            {companyName}
          </CustomText>

          { Boolean(location) && 
          <CustomText style={{ fontSize: 15, color: colors.secondary }}>
            {location.name}
          </CustomText>
          }
        </View>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Octicons name="arrow-switch" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Modal de selección de empresa */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        hardwareAccelerated={true}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: "white",
              borderRadius: 8,
              padding: spacing.md,
            }}
          >
            <CustomText weight={"bold"} style={{ fontSize: 18, marginBottom: spacing.sm }}>
              Cambiar gimnasio
            </CustomText>
            <FlatList
              data={items}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: spacing.sm,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                  onPress={() => handleSwitchCompany(item)}
                >
                  <CustomText style={{ fontSize: 16 }}>
                    {item.label}
                  </CustomText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: spacing.md, alignSelf: "flex-end" }}
            >
              <CustomText style={{ color: colors.primary }}>Cancelar</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
