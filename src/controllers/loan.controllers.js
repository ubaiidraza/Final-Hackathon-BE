import Loan from '../models/loan.models.js'; // Import Loan schema/model

// Add a new loan
export const addLoan = async (req, res) => {
    try {
        const { userId, category, subcategory, amount, loanPeriod, guarantors } = req.body;

        // Validate required fields
        if (!amount) return res.status(400).json({ message: "Amount  Required!" });

        if (!subcategory) return res.status(400).json({ message: "Subcategory Required!" });

        if (!category) return res.status(400).json({ message: "Category  Required!" });

        if (!loanPeriod) return res.status(400).json({ message: "Loan Period  Required!" });
        if (!guarantors) return res.status(400).json({ message: "Guarantors required!" });

        // Create a new loan entry
        const loanData = new Loan({
            userId,
            category,
            loanPeriod,
            guarantors,
            subcategory,
            amount,
            
        });

        // Save the loan to the database
        const savedLoanData = await loanData.save();
        res.status(201).json({ message: "Loan added successfully!", data: savedLoanData });
    } catch (error) {
        console.error("Error in addLoan:", error);
        res.status(500).json({ message: "Failed to add loan.", error });
    }
};

// Fetch all loans (optional filtering by status can be added)
export const fetchLoans = async (req, res) => {
    try {
        // Get all loans
        const loanRecords = await Loan.find({});
        if (loanRecords.length === 0) {
            return res.status(404).json({ message: "No loans available!" });
        }
        res.status(200).json({ message: "Loans retrieved successfully!", data: loanRecords });
    } catch (error) {
        console.error("Error in fetchLoans:", error);
        res.status(500).json({ message: "Failed to retrieve loans.", error });
    }
};

