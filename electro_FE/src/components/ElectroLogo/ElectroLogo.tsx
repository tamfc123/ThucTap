import React from 'react';
import { Image, useMantineColorScheme } from '@mantine/core';
import mylogo from '../../assets/logo.jpg'

interface ElectroLogoProps {
  width?: number;
}

function ElectroLogo({ width = 240 }: ElectroLogoProps) {
  const { colorScheme } = useMantineColorScheme();

  return (
    <Image
      src={mylogo}
      alt="Electro Logo"
      width={width}
      fit="contain"
      sx={{
        filter: colorScheme === 'dark' ? 'invert(1)' : 'none',
      }}
    />
  );
}

export default ElectroLogo;
