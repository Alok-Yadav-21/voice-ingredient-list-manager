-- PostgreSQL Database Setup for Voice Ingredient List Manager
-- Run this script to create the database and tables

-- Create database (run this separately if needed)
-- CREATE DATABASE voice_ingredient_lists;

-- Connect to the database
-- \c voice_ingredient_lists;

-- Create tables
CREATE TABLE IF NOT EXISTS ingredient_lists (
    id SERIAL PRIMARY KEY,
    list_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    number_of_people INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    ingredient_id VARCHAR(255) UNIQUE NOT NULL,
    list_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50) DEFAULT '',
    base_quantity DECIMAL(10,2) DEFAULT 0,
    base_unit VARCHAR(50) DEFAULT '',
    parent_id VARCHAR(255),
    is_sub_ingredient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES ingredient_lists(list_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ingredients_list_id ON ingredients(list_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_parent_id ON ingredients(parent_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_is_sub_ingredient ON ingredients(is_sub_ingredient);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_ingredient_lists_updated_at 
    BEFORE UPDATE ON ingredient_lists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at 
    BEFORE UPDATE ON ingredients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO ingredient_lists (list_id, name, number_of_people) VALUES 
('sample-1', 'Sample Recipe', 4)
ON CONFLICT (list_id) DO NOTHING;

-- CRUD Operations Functions

-- 1. CREATE - Insert new list
CREATE OR REPLACE FUNCTION create_ingredient_list(
    p_list_id VARCHAR(255),
    p_name VARCHAR(255),
    p_number_of_people INTEGER DEFAULT 1
) RETURNS INTEGER AS $$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO ingredient_lists (list_id, name, number_of_people)
    VALUES (p_list_id, p_name, p_number_of_people)
    RETURNING id INTO new_id;
    
    RETURN new_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'List with ID % already exists', p_list_id;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating list: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 2. READ - Get all lists
CREATE OR REPLACE FUNCTION get_all_lists()
RETURNS TABLE (
    list_id VARCHAR(255),
    name VARCHAR(255),
    number_of_people INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    ingredient_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        il.list_id,
        il.name,
        il.number_of_people,
        il.created_at,
        il.updated_at,
        COUNT(i.id) as ingredient_count
    FROM ingredient_lists il
    LEFT JOIN ingredients i ON il.list_id = i.list_id
    GROUP BY il.id, il.list_id, il.name, il.number_of_people, il.created_at, il.updated_at
    ORDER BY il.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. READ - Get list by ID with all ingredients
CREATE OR REPLACE FUNCTION get_list_by_id(p_list_id VARCHAR(255))
RETURNS TABLE (
    list_id VARCHAR(255),
    name VARCHAR(255),
    number_of_people INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    ingredients JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        il.list_id,
        il.name,
        il.number_of_people,
        il.created_at,
        il.updated_at,
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'ingredient_id', i.ingredient_id,
                    'name', i.name,
                    'quantity', i.quantity,
                    'unit', i.unit,
                    'base_quantity', i.base_quantity,
                    'base_unit', i.base_unit,
                    'parent_id', i.parent_id,
                    'is_sub_ingredient', i.is_sub_ingredient,
                    'created_at', i.created_at,
                    'updated_at', i.updated_at
                )
            )
            FROM ingredients i 
            WHERE i.list_id = il.list_id
            ORDER BY i.is_sub_ingredient, i.created_at), 
            '[]'::json
        ) as ingredients
    FROM ingredient_lists il
    WHERE il.list_id = p_list_id;
END;
$$ LANGUAGE plpgsql;

-- 4. UPDATE - Update list
CREATE OR REPLACE FUNCTION update_ingredient_list(
    p_list_id VARCHAR(255),
    p_name VARCHAR(255),
    p_number_of_people INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE ingredient_lists 
    SET name = p_name, number_of_people = p_number_of_people
    WHERE list_id = p_list_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error updating list: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 5. DELETE - Delete list and all its ingredients
CREATE OR REPLACE FUNCTION delete_ingredient_list(p_list_id VARCHAR(255))
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ingredient_lists WHERE list_id = p_list_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting list: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE - Add ingredient to list
CREATE OR REPLACE FUNCTION add_ingredient(
    p_ingredient_id VARCHAR(255),
    p_list_id VARCHAR(255),
    p_name VARCHAR(255),
    p_quantity DECIMAL(10,2) DEFAULT 0,
    p_unit VARCHAR(50) DEFAULT '',
    p_base_quantity DECIMAL(10,2) DEFAULT 0,
    p_base_unit VARCHAR(50) DEFAULT '',
    p_parent_id VARCHAR(255) DEFAULT NULL,
    p_is_sub_ingredient BOOLEAN DEFAULT FALSE
) RETURNS INTEGER AS $$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO ingredients (
        ingredient_id, list_id, name, quantity, unit, 
        base_quantity, base_unit, parent_id, is_sub_ingredient
    )
    VALUES (
        p_ingredient_id, p_list_id, p_name, p_quantity, p_unit,
        p_base_quantity, p_base_unit, p_parent_id, p_is_sub_ingredient
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Ingredient with ID % already exists', p_ingredient_id;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'List with ID % does not exist', p_list_id;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error adding ingredient: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 7. UPDATE - Update ingredient
CREATE OR REPLACE FUNCTION update_ingredient(
    p_ingredient_id VARCHAR(255),
    p_name VARCHAR(255),
    p_quantity DECIMAL(10,2),
    p_unit VARCHAR(50),
    p_base_quantity DECIMAL(10,2),
    p_base_unit VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE ingredients 
    SET name = p_name, quantity = p_quantity, unit = p_unit,
        base_quantity = p_base_quantity, base_unit = p_base_unit
    WHERE ingredient_id = p_ingredient_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error updating ingredient: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 8. DELETE - Delete ingredient
CREATE OR REPLACE FUNCTION delete_ingredient(p_ingredient_id VARCHAR(255))
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ingredients WHERE ingredient_id = p_ingredient_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting ingredient: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 9. Search lists by name
CREATE OR REPLACE FUNCTION search_lists(p_search_term VARCHAR(255))
RETURNS TABLE (
    list_id VARCHAR(255),
    name VARCHAR(255),
    number_of_people INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    ingredient_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        il.list_id,
        il.name,
        il.number_of_people,
        il.created_at,
        il.updated_at,
        COUNT(i.id) as ingredient_count
    FROM ingredient_lists il
    LEFT JOIN ingredients i ON il.list_id = i.list_id
    WHERE il.name ILIKE '%' || p_search_term || '%'
    GROUP BY il.id, il.list_id, il.name, il.number_of_people, il.created_at, il.updated_at
    ORDER BY il.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 10. Get statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    total_lists BIGINT,
    total_ingredients BIGINT,
    total_sub_ingredients BIGINT,
    most_used_ingredient VARCHAR(255),
    most_used_ingredient_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM ingredient_lists) as total_lists,
        (SELECT COUNT(*) FROM ingredients WHERE NOT is_sub_ingredient) as total_ingredients,
        (SELECT COUNT(*) FROM ingredients WHERE is_sub_ingredient) as total_sub_ingredients,
        (SELECT name FROM ingredients 
         WHERE NOT is_sub_ingredient 
         GROUP BY name 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_used_ingredient,
        (SELECT COUNT(*) FROM ingredients 
         WHERE NOT is_sub_ingredient 
         GROUP BY name 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_used_ingredient_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_username;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: ingredient_lists, ingredients';
    RAISE NOTICE 'Functions created: 10 CRUD operations and utility functions';
    RAISE NOTICE 'Sample data inserted: 1 sample list';
END $$; 