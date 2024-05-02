SELECT
    DATEDIFF(
            next_appearance,
            LAG(next_appearance) OVER (ORDER BY next_appearance)
        ) AS gap_days
FROM (
         SELECT day AS next_appearance
         FROM DATA
         WHERE formatted_number = '02' and day >='2024-01-01' and day <= '2024-03-31'
         ORDER BY day
     ) AS appearances;