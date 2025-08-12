import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { colors, typography, components, spacing, layout } from "@/styles";
import CustomText from '@/components/CustomText';
import Octicons from '@expo/vector-icons/Octicons';

export default function TitleCompanyName({company}) {
  return (
    <View style={{
      padding: spacing.sm, 
      paddingHorizontal: spacing.lg, 
      backgroundColor: 'white', 
    }}>
      <View style={[layout.row, {justifyContent: 'space-between'}]}>
        <CustomText style={{fontSize: 23, fontSize: 17, lineHeight: 35 }}>
          {company?.company_name} 
        </CustomText>
        <TouchableOpacity>
          <Octicons name="arrow-switch" size={20} color={colors.blue} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
