export interface ModalDimensions {
  width: string;
  maxHeight: string;
}

export const validateModalDimensions = (dimensions: ModalDimensions): boolean => {
  const widthValid = /^\d+(px|%|vh|vw)$/.test(dimensions.width);
  const heightValid = /^\d+(px|%|vh|vw)$/.test(dimensions.maxHeight);
  return widthValid && heightValid;
};

export const validateModalConfig = (config: any): boolean => {
  return !!(config.dimensions?.desktop && config.dimensions?.tablet && config.dimensions?.mobile && validateModalDimensions(config.dimensions.desktop) && validateModalDimensions(config.dimensions.tablet) && validateModalDimensions(config.dimensions.mobile));
};
