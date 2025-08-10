import React, { useState } from "react";
import { View } from "react-native";
import { colors, typography, components, spacing } from "@/styles";
import CustomText from '@/components/CustomText';

export default function TitleCompanyName({company}) {
  return (
    <View style={{
      padding: spacing.sm, 
      paddingHorizontal: spacing.lg, 
      backgroundColor: 'white', 
      borderBottomColor:'#e1e1e1', 
      borderBottomWidth: 1,
    }}>
      <CustomText style={{fontSize: 23}}>
        {company?.company_name}
      </CustomText>
    </View>
  );
}
