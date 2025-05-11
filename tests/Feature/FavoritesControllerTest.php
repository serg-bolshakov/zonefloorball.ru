<?php
// tests/Feature/FavoritesControllerTest.php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;      // C этим потерял ВСЮ БД... умножил на ноль... 
use Illuminate\Foundation\Testing\DatabaseTransactions; // Откатывает изменения после теста

use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FavoritesControllerTest extends TestCase
{
    // use RefreshDatabase; // Сбрасывает БД после каждого теста
    use DatabaseTransactions; // Безопасная альтернатива RefreshDatabase
    
    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /** @test */
    public function testFavoritesResponse() {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $user->favorites()->create(['product_ids' => [$product->id]]);
        
        $response = $this->actingAs($user)->get('/products/favorites');
        $response->assertJsonFragment([
            'id' => $product->id,
            'price_with_rank_discount' => 276.0, // Пример значения
        ]);
    }

    public function testSyncFavorites()
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->post('/favorites', ['ids' => [1, 2]])
            ->assertJson(['success' => true]);
        
        $this->assertDatabaseHas('favorites', [
            'user_id' => $user->id,
            'product_ids' => json_encode([1, 2])
        ]);
    }

}
