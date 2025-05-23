import { useState, useEffect } from "react";
import Image from "next/image";
import { optionsTree } from "../../../lib/optionsData"; // Ensure this path is correct
import { X } from "lucide-react";
// import { addItemToCart } from '@/lib/shopify'; // Replace with actual path

interface OptionNode {
  label: string;
  basePrice: number;
  final?: boolean;
  children?: Record<string, OptionNode>;
  optionDisplayName?: string; // Optional: If the key isn't the desired button text
}

interface EyeglassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedVariant: any;
}

// Helper function to get the correct title for each step
// It uses the component's getOptionNode and the imported optionsTree.
function getTitleForStep(
  currentStepIndex: number,
  currentSelections: string[],
  tree: Record<string, OptionNode>, // Pass optionsTree here
  getOptionNodeFunc: (
    path: string[],
    currentTree: Record<string, OptionNode>
  ) => OptionNode | undefined
): string {
  if (currentStepIndex === 0) {
    // Explicit title for the very first step, as seen in your screenshot.
    return "Prescription Type";
  }

  // For subsequent steps, the title is the `label` of the parent node.
  const parentNodePath = currentSelections.slice(0, currentStepIndex);

  if (parentNodePath.length === 0 && currentStepIndex > 0) {
    return `Step ${currentStepIndex + 1}`; // Fallback, should not be reached
  }

  const parentNode = getOptionNodeFunc(parentNodePath, tree);
  return parentNode?.label || `Configure Selection`; // Fallback
}

export default function EyeglassesModal({
  isOpen,
  onClose,
  product,
  selectedVariant,
}: EyeglassesModalProps) {
  const [steps, setSteps] = useState<string[][]>([]);
  const [selections, setSelections] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<any>(0);

  useEffect(() => {
    if (isOpen) {
      setSteps([Object.keys(optionsTree)]);
      setSelections([]);
      setTotalPrice(product.price);
    }
  }, [isOpen, selectedVariant]);

  // getOptionNode now takes the tree as an argument for flexibility,
  // though it will primarily use the imported module-level optionsTree.
  const getOptionNode = (
    path: string[],
    currentTree: Record<string, OptionNode>
  ): OptionNode | undefined => {
    if (!path || path.length === 0) {
      return undefined;
    }
    let node: OptionNode | undefined = currentTree[path[0]];
    for (let i = 1; i < path.length; i++) {
      if (!node?.children) return undefined;
      node = node.children[path[i]];
    }
    return node;
  };

  const handleOptionSelect = (optionKey: string, stepIndex: number) => {
    const newSelections = [...selections.slice(0, stepIndex), optionKey];
    const currentNode = getOptionNode(newSelections, optionsTree);

    const newSteps = [...steps.slice(0, stepIndex + 1)];
    if (currentNode?.children && !currentNode.final) {
      newSteps[stepIndex + 1] = Object.keys(currentNode.children);
    } else {
      newSteps.splice(stepIndex + 1);
    }

    setSelections(newSelections);
    setSteps(newSteps);

    let newNumericPrice: any = product.price;

    for (let i = 0; i < newSelections.length; i++) {
      const currentPath = newSelections.slice(0, i + 1);
      const pathNode = getOptionNode(currentPath, optionsTree);
      if (pathNode) {
        // newNumericPrice += pathNode.basePrice;
        newNumericPrice = addPrice(newNumericPrice, pathNode.basePrice);
      } else {
        console.error(
          "Error calculating price: Node not found for path",
          currentPath
        );
        break;
      }
    }
    setTotalPrice(newNumericPrice);
  };

  const handleAddToCart = async () => {
    const customAttributes = selections.map((selKey, index) => {
      let attributeStepTitle = "";
      if (index === 0) {
        attributeStepTitle = "Prescription Type"; // Explicit title for first step's selection category
      } else {
        const parentOfSelectedOptionPath = selections.slice(0, index);
        const parentNode = getOptionNode(
          parentOfSelectedOptionPath,
          optionsTree
        );
        attributeStepTitle = parentNode?.label || `Option Group ${index + 1}`;
      }

      const selectedOptionNode = getOptionNode(
        selections.slice(0, index + 1),
        optionsTree
      );
      const valueDisplay = selectedOptionNode?.optionDisplayName || selKey;

      return {
        key: attributeStepTitle,
        value: valueDisplay,
      };
    });

    console.log("Adding to cart with attributes:", customAttributes);
    // await addItemToCart({ /* ... */ });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative z-50 w-full h-full bg-white flex flex-col md:flex-row md:pt-52">
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
          {selectedVariant?.imageSrc && (
            <img
              src={selectedVariant.imageSrc}
              alt={product?.title || product?.name || "Product Image"}
              className="w-full h-full object-contain"
            />
          )}
        </div>
        <div className="w-full md:w-1/2 h-full p-6 overflow-y-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold">
              Customize Your {product?.name || "Frame"}
            </h2>
            <button onClick={onClose} aria-label="Close customization modal">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-lg mt-2 mb-4 font-medium">Total: {totalPrice}</p>

          {steps.map((stepOptions, stepIndex) => (
            <div key={stepIndex} className="mb-4">
              <h3 className="text-md font-semibold mb-2">
                {getTitleForStep(
                  stepIndex,
                  selections,
                  optionsTree,
                  getOptionNode
                )}
              </h3>
              <div className="flex flex-wrap gap-3">
                {stepOptions.map((optionKey) => {
                  const isSelected = selections[stepIndex] === optionKey;
                  const optionNodePath = [
                    ...selections.slice(0, stepIndex),
                    optionKey,
                  ];
                  const optionNodeDetails = getOptionNode(
                    optionNodePath,
                    optionsTree
                  );
                  const buttonText =
                    optionNodeDetails?.optionDisplayName || optionKey;

                  return (
                    <button
                      key={optionKey}
                      className={`px-4 py-2 rounded border ${
                        isSelected
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-black hover:border-gray-500"
                      } transition-colors duration-150 ease-in-out`}
                      onClick={() => handleOptionSelect(optionKey, stepIndex)}
                    >
                      {buttonText}
                      {optionNodeDetails?.basePrice &&
                      optionNodeDetails.basePrice > 0
                        ? ` (+$${optionNodeDetails.basePrice.toFixed(2)})`
                        : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {selections.length > 0 &&
            !getOptionNode(selections, optionsTree)?.children && (
              <button
                onClick={handleAddToCart}
                className="mt-6 w-full bg-black text-white py-3 rounded text-lg font-semibold active:scale-95 transition duration-300 ease-in-out hover:bg-gray-800"
              >
                Add to Cart - {totalPrice}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

function addPrice(priceString: any, extra: any) {
  const base = parseFloat(priceString.replace("$", ""));
  const total = base + extra;
  return total % 1 === 0 ? `$${total}` : `$${total.toFixed(2)}`;
}
