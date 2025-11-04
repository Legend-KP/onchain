"use client";

/**
 * HomeTab component displays the Passes page with three types of passes.
 * 
 * This is the default tab that users see when they first open the mini app.
 * It shows three passes: Daily, Weekly, and Monthly with their prices.
 * 
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */

interface PassProps {
  price: string;
  name: string;
  textColor: string;
  isHighlighted?: boolean;
}

function PassTicket({ price, name, textColor, isHighlighted = false }: PassProps) {
  const [dollar, cents] = price.split(".");
  
  // Get the actual color value for the text
  const getColorClass = () => {
    if (textColor === "text-white") return "white";
    if (textColor.includes("gray")) return "#9ca3af";
    if (textColor.includes("orange")) return "#fb923c";
    return "white";
  };
  
  const fillColor = getColorClass();
  
  return (
    <div
      className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-md ${
        isHighlighted ? "border-2 border-orange-400" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Price Section */}
        <div className="flex items-baseline">
          <span 
            className="text-5xl font-bold"
            style={{ 
              WebkitTextStroke: '2px black',
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: 'none'
            }}
          >
            ${dollar}
          </span>
          <span 
            className="text-2xl ml-1 font-bold"
            style={{ 
              WebkitTextStroke: '1.5px black',
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: 'none'
            }}
          >
            .{cents}
          </span>
        </div>
        
        {/* Divider */}
        <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-400"></div>
        
        {/* Pass Name Section */}
        <div className="flex flex-col items-end">
          <span 
            className="text-3xl font-bold uppercase"
            style={{ 
              WebkitTextStroke: '2px black',
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: 'none',
              lineHeight: '1.1'
            }}
          >
            {name.split(" ")[0]}
          </span>
          <span 
            className="text-3xl font-bold uppercase"
            style={{ 
              WebkitTextStroke: '2px black',
              WebkitTextFillColor: fillColor,
              color: fillColor,
              textShadow: 'none',
              lineHeight: '1.1'
            }}
          >
            {name.split(" ")[1]}
          </span>
        </div>
        
        {/* Ticket notch */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
      </div>
    </div>
  );
}

export function HomeTab() {
  return (
    <div className="px-6 py-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Passes</h2>
      
      <div className="space-y-4">
        {/* Daily Pass */}
        <PassTicket
          price="1.00"
          name="DAILY PASS"
          textColor="text-white"
        />
        
        {/* Weekly Pass */}
        <PassTicket
          price="3.00"
          name="WEEKLY PASS"
          textColor="text-gray-500 dark:text-gray-400"
        />
        
        {/* Monthly Pass - Highlighted */}
        <PassTicket
          price="9.00"
          name="MONTHLY PASS"
          textColor="text-orange-400"
          isHighlighted={true}
        />
      </div>
    </div>
  );
} 