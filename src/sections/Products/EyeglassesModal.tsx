import { useState, useEffect } from "react";
import Image from "next/image";
import { optionsTree } from "../../../lib/optionsData";
import { X } from "lucide-react";
// import { addItemToCart } from '@/lib/shopify'; // Replace with actual path

interface OptionNode {
  basePrice: number;
  final?: boolean;
  children?: Record<string, OptionNode>;
}

interface EyeglassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedVariant: any;
}

export default function EyeglassesModal({
  isOpen,
  onClose,
  product,
  selectedVariant,
}: EyeglassesModalProps) {
  const [steps, setSteps] = useState<string[][]>([]);
  const [selections, setSelections] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(product.basePrice);

  useEffect(() => {
    if (isOpen) {
      setSteps([Object.keys(optionsTree)]);
      setSelections([]);
      setTotalPrice(product.price);
    }
  }, [isOpen, product.basePrice]);

  const getOptionNode = (path: string[]): OptionNode | undefined => {
    let node: OptionNode | undefined = optionsTree[path[0]];
    for (let i = 1; i < path.length; i++) {
      if (!node?.children) return undefined;
      node = node.children[path[i]];
    }
    return node;
  };

  const handleOptionSelect = (optionLabel: string, stepIndex: number) => {
    const newSelections = [...selections.slice(0, stepIndex), optionLabel];
    const node = getOptionNode(newSelections);

    const newSteps = [...steps.slice(0, stepIndex + 1)];
    if (node?.children && !node.final) {
      newSteps[stepIndex + 1] = Object.keys(node.children);
    } else {
      newSteps.splice(stepIndex + 1);
    }

    setSelections(newSelections);
    setSteps(newSteps);

    let newPrice = product.price;
    let currentNode = optionsTree[newSelections[0]];
    if (currentNode) {
      //   newPrice += currentNode.basePrice;
      newPrice = addPrice(newPrice.toString(), currentNode.basePrice);
      for (let i = 1; i < newSelections.length; i++) {
        currentNode = currentNode.children?.[newSelections[i]];
        if (currentNode) {
          //   newPrice += currentNode.basePrice;
          newPrice = addPrice(newPrice.toString(), currentNode.basePrice);
        }
      }
    }
    setTotalPrice(newPrice);
  };

  const handleAddToCart = async () => {
    const customAttributes = selections.map((sel, index) => ({
      key: `Option ${index + 1}`,
      value: sel,
    }));

    // await addItemToCart({
    //   variantId: product.variantId,
    //   quantity: 1,
    //   customAttributes,
    // });

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
          <img
            src={selectedVariant.imageSrc}
            alt={product.title}
            className="object-contain"
          />
        </div>

        <div className="w-full md:w-1/2 h-full p-6 overflow-y-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold">
              Customize Your {product.name} Frame
            </h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-lg mt-2 mb-4 font-medium">Total: {totalPrice}</p>

          {steps.map((stepOptions, stepIndex) => (
            <div key={stepIndex} className="mb-4">
              <h3 className="text-md font-semibold mb-2">
                Step {stepIndex + 1}
              </h3>
              <div className="flex flex-wrap gap-3">
                {stepOptions.map((option) => {
                  const isSelected = selections[stepIndex] === option;
                  return (
                    <button
                      key={option}
                      className={`px-4 py-2 rounded border ${
                        isSelected
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-black"
                      }`}
                      onClick={() => handleOptionSelect(option, stepIndex)}
                    >
                      {option}
                      {(() => {
                        const node = getOptionNode([
                          ...selections.slice(0, stepIndex),
                          option,
                        ]);
                        return node?.basePrice > 0
                          ? ` (+$${node.basePrice})`
                          : "";
                      })()}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {steps.length > 0 && !getOptionNode(selections)?.children && (
            <button
              onClick={handleAddToCart}
              className="mt-6 w-full bg-black text-white py-3 rounded text-lg font-semibold active:scale-95 transition duration-300 ease-in-out"
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
