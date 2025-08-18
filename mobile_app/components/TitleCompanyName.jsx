import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { colors, typography, components, spacing, layout } from "@/styles";
import CustomText from '@/components/CustomText';
import { getCurrentCompany } from "@/utils/storage";
import Octicons from '@expo/vector-icons/Octicons';

export default function TitleCompanyName({}) {
  const [currentCompany, setCurrentCompany] = useState();

  // Cargar empresa solo una vez
  useEffect(() => {
    getCurrentCompany().then(setCurrentCompany);
  }, []);

  return (
    <View style={{
      padding: spacing.sm, 
      paddingHorizontal: spacing.lg, 
      backgroundColor: 'white', 
    }}>
      <View style={[layout.row, {justifyContent: 'space-between'}]}>
        <CustomText style={{fontSize: 23, fontSize: 17, lineHeight: 35 }}>
          {currentCompany?.company_name} 
        </CustomText>
        <TouchableOpacity>
          <Octicons name="arrow-switch" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
