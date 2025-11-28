export const playInteractionSound = (type: string) => {
    // Ovoz effektlari uchun joy
    console.log(`Sound: ${type}`);
  };
  
  export const playReactionSound = (type: string, success: boolean) => {
    console.log(`Reaction Sound: ${type}, Success: ${success}`);
  };