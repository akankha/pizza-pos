import type { CustomPizza } from '../../../shared/types';

interface PizzaPreviewProps {
  pizza: CustomPizza;
  toppingNames: { [key: string]: string };
}

export default function PizzaPreview({ pizza, toppingNames }: PizzaPreviewProps) {
  const toppingColors: { [key: string]: string } = {
    meat: '#8B4513',
    veggie: '#228B22',
    cheese: '#FFD700',
    sauce: '#DC143C',
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="pizza-preview relative">
        {/* Pizza base */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 flex items-center justify-center">
          {/* Crust label */}
          <div className="absolute top-4 left-0 right-0 text-center">
            <span className="text-sm font-semibold text-pizza-brown bg-white/80 px-3 py-1 rounded-full">
              {pizza.crust.charAt(0).toUpperCase() + pizza.crust.slice(1)} Crust
            </span>
          </div>
          
          {/* Size indicator */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="text-lg font-bold text-pizza-brown bg-white/80 px-4 py-2 rounded-full">
              {pizza.size.toUpperCase()}
            </span>
          </div>

          {/* Toppings as dots */}
          <div className="absolute inset-8 rounded-full">
            {pizza.toppings.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400 text-center text-lg">
                  Add toppings
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 p-4">
                {pizza.toppings.slice(0, 9).map((toppingId, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-full shadow-md flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      backgroundColor: toppingColors.meat,
                    }}
                    title={toppingNames[toppingId]}
                  >
                    {toppingNames[toppingId]?.slice(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topping list */}
      {pizza.toppings.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-lg mb-2 text-pizza-brown">Toppings:</h3>
          <div className="flex flex-wrap gap-2">
            {pizza.toppings.map((toppingId) => (
              <span
                key={toppingId}
                className="bg-pizza-cream text-pizza-brown px-3 py-1 rounded-full text-sm font-semibold"
              >
                {toppingNames[toppingId]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
