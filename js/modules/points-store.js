// 积分商城管理模块
class PointsStoreManager {
    constructor() {
        this.products = this.loadProducts();
        this.currentEditId = null;
        this.currentViewId = null;
        this.init();
    }

    init() {
        this.renderProducts();
        this.bindEvents();
    }

    // 从本地存储加载商品数据
    loadProducts() {
        const data = localStorage.getItem('pointsStoreProducts');
        if (data) {
            return JSON.parse(data);
        }
        // 返回一些示例数据
        return [
            {
                id: this.generateId(),
                name: '笔记本',
                category: '文具',
                points: 50,
                image: '',
                description: '精美笔记本，适合做课堂笔记',
                stock: 20
            },
            {
                id: this.generateId(),
                name: '钢笔套装',
                category: '文具',
                points: 80,
                image: '',
                description: '高品质钢笔套装，书写流畅',
                stock: 15
            },
            {
                id: this.generateId(),
                name: '编程书籍',
                category: '书籍',
                points: 150,
                image: '',
                description: '经典编程入门书籍',
                stock: 10
            },
            {
                id: this.generateId(),
                name: '机器人玩具',
                category: '玩具',
                points: 300,
                image: '',
                description: '可编程机器人玩具，寓教于乐',
                stock: 5
            }
        ];
    }

    // 保存商品数据到本地存储
    saveProducts() {
        localStorage.setItem('pointsStoreProducts', JSON.stringify(this.products));
    }

    // 生成唯一ID
    generateId() {
        return 'PROD' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // 渲染商品列表
    renderProducts(filteredProducts = null) {
        const productsGrid = document.getElementById('productsGrid');
        const displayProducts = filteredProducts || this.products;

        if (displayProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-box-open"></i>
                    <p>暂无商品</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = displayProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}">` : 
                        `<i class="fas fa-gift"></i>`
                    }
                </div>
                <div class="product-info">
                    <div class="product-header">
                        <h3 class="product-name">${product.name}</h3>
                        ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
                    </div>
                    <div class="product-points">
                        <span class="points-badge">
                            <i class="fas fa-star"></i>
                            ${product.points} 积分
                        </span>
                        <span class="product-stock">库存: ${product.stock}</span>
                    </div>
                    <p class="product-description">${product.description || '暂无描述'}</p>
                    <div class="product-actions">
                        <button class="btn-edit" onclick="pointsStoreManager.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn-delete" onclick="pointsStoreManager.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // 为商品卡片添加点击事件（除了按钮区域）
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.product-actions')) {
                    this.viewProduct(card.dataset.id);
                }
            });
        });
    }

    // 绑定事件
    bindEvents() {
        // 添加商品按钮
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showProductModal();
        });

        // 表单提交
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // 取消按钮
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideProductModal();
        });

        // 关闭模态框
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.classList.remove('active');
            });
        });

        // 点击模态框外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.querySelector('.btn-search');
        
        searchBtn.addEventListener('click', () => this.searchProducts());
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.searchProducts();
            }
        });

        // 筛选功能
        document.getElementById('pointsFilter').addEventListener('change', () => {
            this.filterProducts();
        });

        // 详情模态框的编辑和删除按钮
        document.getElementById('editFromDetailsBtn').addEventListener('click', () => {
            document.getElementById('productDetailsModal').classList.remove('active');
            this.editProduct(this.currentViewId);
        });

        document.getElementById('deleteFromDetailsBtn').addEventListener('click', () => {
            document.getElementById('productDetailsModal').classList.remove('active');
            this.deleteProduct(this.currentViewId);
        });
    }

    // 显示添加/编辑商品模态框
    showProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const title = modal.querySelector('.modal-header h3');
        
        if (product) {
            title.textContent = '编辑商品';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productPoints').value = product.points;
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productStock').value = product.stock;
            this.currentEditId = product.id;
        } else {
            title.textContent = '添加商品';
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            this.currentEditId = null;
        }
        
        modal.classList.add('active');
    }

    // 隐藏商品模态框
    hideProductModal() {
        document.getElementById('productModal').classList.remove('active');
        document.getElementById('productForm').reset();
        this.currentEditId = null;
    }

    // 保存商品
    saveProduct() {
        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value.trim();
        const points = parseInt(document.getElementById('productPoints').value);
        const image = document.getElementById('productImage').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        const stock = parseInt(document.getElementById('productStock').value);

        if (!name || !points || points < 0 || stock < 0) {
            alert('请填写完整的商品信息！');
            return;
        }

        if (this.currentEditId) {
            // 编辑现有商品
            const index = this.products.findIndex(p => p.id === this.currentEditId);
            if (index !== -1) {
                this.products[index] = {
                    ...this.products[index],
                    name,
                    category,
                    points,
                    image,
                    description,
                    stock
                };
            }
        } else {
            // 添加新商品
            const newProduct = {
                id: this.generateId(),
                name,
                category,
                points,
                image,
                description,
                stock
            };
            this.products.unshift(newProduct);
        }

        this.saveProducts();
        this.renderProducts();
        this.hideProductModal();
    }

    // 编辑商品
    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.showProductModal(product);
        }
    }

    // 删除商品
    deleteProduct(id) {
        if (confirm('确定要删除这个商品吗？')) {
            this.products = this.products.filter(p => p.id !== id);
            this.saveProducts();
            this.renderProducts();
        }
    }

    // 查看商品详情
    viewProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.currentViewId = id;
        
        const modal = document.getElementById('productDetailsModal');
        const detailImage = document.getElementById('detailImage');
        const imageContainer = detailImage.parentElement;
        
        if (product.image) {
            detailImage.src = product.image;
            detailImage.style.display = 'block';
            imageContainer.innerHTML = `<img id="detailImage" src="${product.image}" alt="${product.name}">`;
        } else {
            imageContainer.innerHTML = `<i class="fas fa-gift" style="font-size: 5rem; color: var(--primary-color);"></i>`;
        }
        
        document.getElementById('detailName').textContent = product.name;
        document.getElementById('detailCategory').textContent = product.category || '未分类';
        document.getElementById('detailPoints').innerHTML = `<i class="fas fa-star"></i> ${product.points} 积分`;
        document.getElementById('detailStock').textContent = product.stock;
        document.getElementById('detailDescription').textContent = product.description || '暂无描述';
        
        modal.classList.add('active');
    }

    // 搜索商品
    searchProducts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        
        if (!searchTerm) {
            this.renderProducts();
            return;
        }

        const filtered = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );

        this.renderProducts(filtered);
    }

    // 筛选商品
    filterProducts() {
        const filterValue = document.getElementById('pointsFilter').value;
        
        if (!filterValue) {
            this.renderProducts();
            return;
        }

        let filtered = [];

        if (filterValue === '0-50') {
            filtered = this.products.filter(p => p.points >= 0 && p.points <= 50);
        } else if (filterValue === '51-100') {
            filtered = this.products.filter(p => p.points >= 51 && p.points <= 100);
        } else if (filterValue === '101-200') {
            filtered = this.products.filter(p => p.points >= 101 && p.points <= 200);
        } else if (filterValue === '201+') {
            filtered = this.products.filter(p => p.points >= 201);
        }

        this.renderProducts(filtered);
    }
}

// 初始化积分商城管理器
const pointsStoreManager = new PointsStoreManager();

