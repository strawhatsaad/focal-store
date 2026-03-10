// File: Focal/lib/optionsData.ts

export interface OptionNode {
  label: string;
  basePrice: number;
  final?: boolean;
  children?: Record<string, OptionNode>;
  optionDisplayName?: string;
  description?: string;
  includedFeatures?: string[];
}

const classicLensMaterial: Record<string, OptionNode> = {
  Classic: {
    label: "Final Option",
    basePrice: 0,
    final: true,
    description:
      "Our impact-resistant polycarbonate lenses are a good option for prescriptions that range between -3.00 and +3.00.",
  },
  Thinner: {
    label: "Final Option",
    basePrice: 60,
    final: true,
    description:
      "Our 1.67 high-index lenses are thinner and more lightweight when accommodating stronger prescriptions.",
  },
};

const lightResponsiveColors: Record<string, OptionNode> = {
  Grey: { label: "Final Option", basePrice: 0, final: true },
  Brown: { label: "Final Option", basePrice: 0, final: true },
  Green: { label: "Final Option", basePrice: 0, final: true },
  Blue: { label: "Final Option", basePrice: 0, final: true },
};

const lightResponsiveType: Record<string, OptionNode> = {
  Signature: {
    label: "Select a color",
    basePrice: 0,
    description:
      "These transition from clear indoors to dark outdoors and also block 100% of UVA and UVB rays.",
    children: lightResponsiveColors,
  },
  "Transitions® XTRActive®": {
    label: "Select a color",
    basePrice: 50,
    description:
      "These are the only lenses that transition effectively in the car. They also get the darkest outdoors and have a hint of tint indoors.",
    children: lightResponsiveColors,
  },
};

// Reusable lens type block for Rx paths where material selection follows
const rxLensTypes: Record<string, OptionNode> = {
  Classic: {
    label: "Select a lens material",
    basePrice: 0,
    description:
      "UV-blocking lenses with scratch-resistant, anti-reflective coatings",
    children: classicLensMaterial,
  },
  "Blue-light-filtering": {
    label: "Select a lens material",
    basePrice: 50,
    description:
      "UV-blocking lenses with scratch-resistant, anti-reflective coatings—plus a special treatment that helps block potentially pesky blue light.",
    children: classicLensMaterial,
  },
  "Light responsive": {
    label: "Select a light responsive type",
    basePrice: 125,
    description:
      "UV-blocking lenses with scratch-resistant, anti-reflective coatings—these also transition from clear to a darker tint outdoors.",
    children: {
      Signature: {
        label: "Select a lens color",
        basePrice: 0,
        description: "Standard transition.",
        children: {
          ...Object.fromEntries(
            Object.entries(lightResponsiveColors).map(([k, v]) => [
              k,
              {
                ...v,
                children: classicLensMaterial,
                final: false,
                label: "Select a lens material",
              },
            ]),
          ),
        },
      },
      "Transitions® XTRActive®": {
        label: "Select a lens color",
        basePrice: 50,
        description: "Extra dark outdoors, works in the car.",
        children: {
          ...Object.fromEntries(
            Object.entries(lightResponsiveColors).map(([k, v]) => [
              k,
              {
                ...v,
                children: classicLensMaterial,
                final: false,
                label: "Select a lens material",
              },
            ]),
          ),
        },
      },
    },
  },
};

// For Non-Rx, there is no lens material selection, it ends after color/type
const nonRxLensTypes: Record<string, OptionNode> = {
  Classic: {
    label: "Final Option",
    basePrice: 0,
    description:
      "UV-blocking lenses with scratch-resistant, anti-reflective coatings",
    final: true,
  },
  "Blue-light-filtering": {
    label: "Final Option",
    basePrice: 50,
    description:
      "UV-blocking lenses with scratch-resistant, anti-reflective coatings—plus a special treatment that helps block potentially pesky blue light.",
    final: true,
  },
  "Light responsive": {
    label: "Select a light responsive type",
    basePrice: 125,
    description:
      "UV-blocking lenses with scratch-resistant, anti-reflective coatings—these also transition from clear to a darker tint outdoors.",
    children: lightResponsiveType,
  },
};

export const optionsTree: Record<string, OptionNode> = {
  "Single-vision": {
    label: "Select a vision type",
    basePrice: 0,
    description:
      "These correct one field of vision (nearsightedness, farsightedness, or astigmatism).",
    children: {
      Standard: {
        label: "Select a lens type",
        basePrice: 0,
        description:
          "Corrects one field of vision—plus it comes with anti-reflective and scratch-resistant coatings.",
        children: rxLensTypes,
      },
      "Anti-fatigue": {
        label: "Select a lens type",
        basePrice: 100,
        description:
          "Designed to help lessen eye strain from looking at digital devices or reading for prolonged periods. They feature a small magnification boost at the bottom.",
        children: rxLensTypes,
      },
    },
  },
  Progressives: {
    label: "Select a progressives type",
    basePrice: 230,
    description:
      "These offer multiple fields of vision in one lens, seamlessly transitioning from near to far.",
    children: {
      Signature: {
        label: "Select a lens type",
        basePrice: 0,
        description:
          "Digital free-form lenses for a comfortable, balanced view. Includes anti-reflective and scratch-resistant coatings.",
        children: rxLensTypes,
      },
      Precision: {
        label: "Select a lens type",
        basePrice: 70,
        description:
          "Widest field of view with more customization for reduced peripheral distortion.",
        children: rxLensTypes,
      },
    },
  },
  "Non-prescription": {
    label: "Select a lens type",
    basePrice: 0,
    description:
      "For those who want stylish frames without any vision correction.",
    children: nonRxLensTypes,
  },
  Readers: {
    label: "Select a readers strength",
    basePrice: 0,
    description:
      "For those who just need a little boost for near-vision activities like reading.",
    children: {
      ...Object.fromEntries(
        [
          "+0.25",
          "+0.50",
          "+0.75",
          "+1.00",
          "+1.25",
          "+1.50",
          "+1.75",
          "+2.00",
          "+2.25",
          "+2.50",
          "+2.75",
        ].map((strength) => [
          strength,
          {
            label: "Select a lens type",
            basePrice: 0,
            children: rxLensTypes,
          } as OptionNode,
        ]),
      ),
    },
  },
};
