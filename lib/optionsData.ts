// File: Focal/lib/optionsData.ts

// Define or import the OptionNode interface. 
// It should match the definition in EyeglassesModal.tsx
export interface OptionNode {
    label: string;
    basePrice: number;
    final?: boolean;
    children?: Record<string, OptionNode>; // This allows string indexing for children
    optionDisplayName?: string; // Ensure this field is in your actual OptionNode if used
}

// Explicitly type optionsTree with a string index signature
export const optionsTree: Record<string, OptionNode> = {
    "Single-vision": {
        label: "Single-Vision Lens Options",
        basePrice: 0,
        children: {
            "Standard": {
                label: "Lens Type",
                basePrice: 0,
                children: {
                    "Classic": {
                        label: "Lens Material",
                        basePrice: 0,
                        children: {
                            "Classic": {
                                label: "Final Option",
                                basePrice: 0,
                                final: true,
                            },
                            "Thinner": {
                                label: "Final Option",
                                basePrice: 60,
                                final: true,
                            },
                        },
                    },
                    "Blue-light filtering": {
                        label: "Lens Material",
                        basePrice: 50,
                        children: {
                            "Classic": {
                                label: "Final Option",
                                basePrice: 0,
                                final: true,
                            },
                            "Thinner": {
                                label: "Final Option",
                                basePrice: 60,
                                final: true,
                            },
                        },
                    },
                    "Light-responsive": {
                        label: "Light-responsive Lens Type",
                        basePrice: 125,
                        children: {
                            "Signature": {
                                label: "Lens Color",
                                basePrice: 0,
                                // final: true, // This was here, but Signature itself has children (colors)
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                            "Transitions XTRActive": {
                                label: "Lens Color",
                                basePrice: 50,
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                        },
                    },
                }
            },
            "Anti-Fatigue": {
                label: "Lens Type",
                basePrice: 100,
                children: {
                    "Classic": {
                        label: "Lens Material",
                        basePrice: 0,
                        children: {
                            "Classic": { label: "Final Option", basePrice: 0, final: true },
                            "Thinner": { label: "Final Option", basePrice: 60, final: true },
                        },
                    },
                    "Blue-light filtering": {
                        label: "Lens Material",
                        basePrice: 50,
                        children: {
                            "Classic": { label: "Final Option", basePrice: 0, final: true },
                            "Thinner": { label: "Final Option", basePrice: 60, final: true },
                        },
                    },
                    "Light-responsive": {
                        label: "Light-responsive Lens Type",
                        basePrice: 125,
                        children: {
                            "Signature": {
                                label: "Lens Color",
                                basePrice: 0,
                                // final: true, // Also here, has children
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                            "Transitions XTRActive": {
                                label: "Lens Color",
                                basePrice: 50,
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    "Progressives": {
        label: "Progressive Lens Type",
        basePrice: 230,
        children: {
            "Signature": {
                label: "Lens Type",
                basePrice: 0,
                children: {
                    "Classic": {
                        label: "Lens Material",
                        basePrice: 0,
                        children: {
                            "Classic": { label: "Final Option", basePrice: 0, final: true },
                            "Thinner": { label: "Final Option", basePrice: 60, final: true },
                        },
                    },
                    "Blue-light filtering": {
                        label: "Lens Material",
                        basePrice: 50,
                        children: {
                            "Classic": { label: "Final Option", basePrice: 0, final: true },
                            "Thinner": { label: "Final Option", basePrice: 60, final: true },
                        },
                    },
                    "Light-responsive": {
                        label: "Light-responsive Lens Type",
                        basePrice: 125,
                        children: {
                            "Signature": {
                                label: "Lens Color",
                                basePrice: 0,
                                // final: true,
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                            "Transitions XTRActive": {
                                label: "Lens Color",
                                basePrice: 50,
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                        },
                    },
                },
            },
            "Precision": {
                label: "Lens Type",
                basePrice: 70,
                children: {
                    "Classic": {
                        label: "Lens Material",
                        basePrice: 0,
                        children: {
                            "Classic": { label: "Final Option", basePrice: 0, final: true },
                            "Thinner": { label: "Final Option", basePrice: 60, final: true },
                        },
                    },
                    "Blue-light filtering": {
                        label: "Lens Material",
                        basePrice: 50,
                        children: {
                            "Classic": { label: "Final Option", basePrice: 0, final: true },
                            "Thinner": { label: "Final Option", basePrice: 60, final: true },
                        },
                    },
                    "Light-responsive": {
                        label: "Light-responsive Lens Type",
                        basePrice: 125,
                        children: {
                            "Signature": {
                                label: "Lens Color",
                                basePrice: 0,
                                // final: true,
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                            "Transitions XTRActive": {
                                label: "Lens Color",
                                basePrice: 50,
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    "Non Prescription Lens": {
        label: "Lens Type",
        basePrice: 0,
        children: {
            "Classic": {
                label: "Lens Material",
                basePrice: 0,
                children: {
                    "Classic": { label: "Final Option", basePrice: 0, final: true },
                    "Thinner": { label: "Final Option", basePrice: 60, final: true },
                },
            },
            "Blue-light filtering": {
                label: "Lens Material",
                basePrice: 50,
                children: {
                    "Classic": { label: "Final Option", basePrice: 0, final: true },
                    "Thinner": { label: "Final Option", basePrice: 60, final: true },
                },
            },
            "Light-responsive": {
                label: "Light-responsive Lens Type",
                basePrice: 125,
                children: {
                    "Signature": {
                        label: "Lens Color",
                        basePrice: 0,
                        // final: true, 
                        children: {
                            "Grey": { label: "Final Option", basePrice: 0, final: true },
                            "Brown": { label: "Final Option", basePrice: 0, final: true },
                            "Green": { label: "Final Option", basePrice: 0, final: true },
                        },
                    },
                    "Transitions XTRActive": {
                        label: "Lens Color",
                        basePrice: 50,
                        children: {
                            "Grey": { label: "Final Option", basePrice: 0, final: true },
                            "Brown": { label: "Final Option", basePrice: 0, final: true },
                            "Green": { label: "Final Option", basePrice: 0, final: true },
                        },
                    },
                },
            },
        },
    },
    "Readers Lens": {
        label: "Reading Strength",
        basePrice: 0,
        children: {
            "+0.25": { // This key is fine as Record<string, OptionNode> handles it
                label: "Lens Type",
                basePrice: 0,
                children: {
                    "Classic": {
                        label: "Lens Material",
                        basePrice: 0,
                        children: {
                            "Classic": { label: "Final Option", basePrice: 0, final: true },
                            "Thinner": { label: "Final Option", basePrice: 60, final: true },
                        },
                    },
                    "Blue-light filtering": {
                        label: "Lens Material",
                        basePrice: 50,
                        children: {
                            "Classic": { label: "Final Option", basePrice: 0, final: true },
                            "Thinner": { label: "Final Option", basePrice: 60, final: true },
                        },
                    },
                    "Light-responsive": {
                        label: "Light-responsive Lens Type",
                        basePrice: 125,
                        children: {
                            "Signature": {
                                label: "Lens Color",
                                basePrice: 0,
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                            "Transitions XTRActive": {
                                label: "Lens Color",
                                basePrice: 50,
                                children: {
                                    "Grey": { label: "Final Option", basePrice: 0, final: true },
                                    "Brown": { label: "Final Option", basePrice: 0, final: true },
                                    "Green": { label: "Final Option", basePrice: 0, final: true },
                                },
                            },
                        },
                    },
                },
            },
            // Spreading dynamically generated keys into a Record<string, OptionNode> is fine
            ...Object.fromEntries(
                ["+0.50", "+0.75", "+1.00", "+1.25", "+1.50", "+1.75", "+2.00", "+2.25", "+2.50"].map(strength => [
                    strength,
                    {
                        label: "Lens Type",
                        basePrice: 0,
                        children: {
                            "Classic": {
                                label: "Lens Material",
                                basePrice: 0,
                                children: {
                                    "Classic": { label: "Final Option", basePrice: 0, final: true },
                                    "Thinner": { label: "Final Option", basePrice: 60, final: true },
                                },
                            },
                            "Blue-light filtering": {
                                label: "Lens Material",
                                basePrice: 50,
                                children: {
                                    "Classic": { label: "Final Option", basePrice: 0, final: true },
                                    "Thinner": { label: "Final Option", basePrice: 60, final: true },
                                },
                            },
                            "Light-responsive": {
                                label: "Light-responsive Lens Type",
                                basePrice: 125,
                                children: {
                                    "Signature": {
                                        label: "Lens Color",
                                        basePrice: 0,
                                        children: {
                                            "Grey": { label: "Final Option", basePrice: 0, final: true },
                                            "Brown": { label: "Final Option", basePrice: 0, final: true },
                                            "Green": { label: "Final Option", basePrice: 0, final: true },
                                        },
                                    },
                                    "Transitions XTRActive": {
                                        label: "Lens Color",
                                        basePrice: 50,
                                        children: {
                                            "Grey": { label: "Final Option", basePrice: 0, final: true },
                                            "Brown": { label: "Final Option", basePrice: 0, final: true },
                                            "Green": { label: "Final Option", basePrice: 0, final: true },
                                        },
                                    },
                                },
                            },
                        },
                    } as OptionNode // Added 'as OptionNode' for stronger typing of the mapped object
                ])
            )
        }
    }
};
