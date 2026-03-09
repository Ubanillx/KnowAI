import os

# 配置项
OUTPUT_FILE = "project_context.txt"
# 排除不需要扫描的文件夹（减少干扰信息）
EXCLUDE_DIRS = {'.git', '.idea', '.vscode', '__pycache__', 'node_modules', 'venv', 'bin', 'obj'}
# 定义需要读取的源码后缀
SOURCE_EXTENSIONS = {'.py', '.tsx','.cs', '.gd', '.cpp', '.h', '.js', '.ts', '.java', '.css', '.html', '.json'}

def generate_project_context(root_dir):
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("========== PROJECT STRUCTURE ==========\n")
        
        # 1. 生成目录树
        for root, dirs, files in os.walk(root_dir):
            # 过滤掉不需要的目录
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            level = root.replace(root_dir, '').count(os.sep)
            indent = '  ' * level
            f.write(f"{indent}{os.path.basename(root)}/\n")
            sub_indent = '  ' * (level + 1)
            for file in files:
                if any(file.endswith(ext) for ext in SOURCE_EXTENSIONS):
                    f.write(f"{sub_indent}{file}\n")
        
        f.write("\n" + "="*40 + "\n\n")
        f.write("========== SOURCE CODE CONTENT ==========\n\n")
        
        # 2. 读取源码内容
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                if any(file.endswith(ext) for ext in SOURCE_EXTENSIONS) and file != os.path.basename(__file__):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, root_dir)
                    
                    f.write(f"--- FILE: {relative_path} ---\n")
                    try:
                        with open(file_path, 'r', encoding='utf-8') as source_f:
                            f.write(source_f.read())
                    except Exception as e:
                        f.write(f"[Error reading file: {e}]")
                    f.write("\n\n")

    print(f"成功！项目上下文已写入: {OUTPUT_FILE}")

if __name__ == "__main__":
    # 获取当前脚本所在目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    generate_project_context(current_dir)